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
export function authConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(process.env.ADMIN_PASSWORD_HASH || ""));
}
export function verifyCredentials(username: unknown, password: unknown) {
  if (!authConfigured() || typeof username !== "string" || typeof password !== "string" || password.length > 1024) return false;
  const [salt, hash] = process.env.ADMIN_PASSWORD_HASH!.split(":");
  const passwordMatches = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
  return timingSafeEqual(Buffer.from(digest(username)), Buffer.from(digest(process.env.ADMIN_USERNAME!))) && passwordMatches;
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  await writeFile(sessionFile(token), JSON.stringify({ username: process.env.ADMIN_USERNAME, credential: digest(process.env.ADMIN_PASSWORD_HASH!), expires: Date.now() + sessionSeconds * 1000 }), { flag: "wx", mode: 0o600 });
  return token;
}
export async function deleteSession(token?: string) {
  if (token && /^[a-f0-9]{64}$/.test(token)) await rm(sessionFile(token), { force: true });
}
export async function getStaff() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!authConfigured() || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  try {
    const session = JSON.parse(await readFile(sessionFile(token), "utf8"));
    if (session.expires <= Date.now() || session.username !== process.env.ADMIN_USERNAME || session.credential !== digest(process.env.ADMIN_PASSWORD_HASH!)) {
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
