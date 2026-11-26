import { databaseEnabled, readDocument, writeDocument, deleteDocument } from "@/lib/supabase/storage";
import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const sessionCookie = "ice_staff";
export const sessionSeconds = 8 * 60 * 60;
const directory = () => path.join(process.env.ADMIN_DATA_DIR || path.join(process.cwd(), ".data", "admin"), "sessions");
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const sessionFile = (token: string) => path.join(directory(), digest(token) + ".json");
interface StaffCredential { username: string; passwordHash: string }
interface StaffSession { username: string; credential: string; expires: number }
async function staffCredential(): Promise<StaffCredential | null> {
  if (databaseEnabled()) return (await readDocument<StaffCredential>("staff", "operator"))?.payload ?? null;
  return process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH ? { username: process.env.ADMIN_USERNAME, passwordHash: process.env.ADMIN_PASSWORD_HASH } : null;
}
export async function authConfigured() {
  const credential = await staffCredential();
  return Boolean(credential?.username && /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(credential.passwordHash));
}
export async function verifyCredentials(username: unknown, password: unknown) {
  const credential = await staffCredential();
  if (!credential || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(credential.passwordHash) || typeof username !== "string" || typeof password !== "string" || password.length > 1024) return null;
  const [salt, hash] = credential.passwordHash.split(":");
  const passwordMatches = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
  return timingSafeEqual(Buffer.from(digest(username)), Buffer.from(digest(credential.username))) && passwordMatches ? credential : null;
}
export async function createSession(credential: StaffCredential) {
  const token = randomBytes(32).toString("hex");

  const session = { username: credential.username, credential: digest(credential.passwordHash), expires: Date.now() + sessionSeconds * 1000 };
  if (databaseEnabled()) {
    await writeDocument("sessions", digest(token), session, 0, new Date(session.expires).toISOString());
    return token;
  }
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  await writeFile(sessionFile(token), JSON.stringify(session), { flag: "wx", mode: 0o600 });
  return token;
}
export async function deleteSession(token?: string) {
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    if (databaseEnabled()) await deleteDocument("sessions", digest(token));
    else await rm(sessionFile(token), { force: true });
  }
}
export async function getStaff() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const credential = await staffCredential();
  if (!credential) return null;
  try {
    const session: StaffSession | undefined = databaseEnabled()
      ? (await readDocument<StaffSession>("sessions", digest(token)))?.payload
      : JSON.parse(await readFile(sessionFile(token), "utf8"));
    if (!session) return null;
    if (session.expires <= Date.now() || session.username !== credential.username || session.credential !== digest(credential.passwordHash)) {
      await deleteSession(token);
      return null;
    }
    return { username: session.username as string };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function requireStaff() {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}
