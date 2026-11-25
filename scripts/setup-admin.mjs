import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
if (!process.stdin.isTTY) throw new Error("Run this setup interactively in a terminal.");
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
const prompt = createInterface({ input: process.stdin, output, terminal: true });
try {
  const username = (await prompt.question("Staff username: ")).trim();
  if (!/^[a-zA-Z0-9_.@-]{1,100}$/.test(username)) throw new Error("Use 1–100 letters, digits or _.@- in the username.");
  process.stdout.write("Password (at least 16 characters; hidden): ");
  muted = true;
  const password = await prompt.question("");
  process.stdout.write("\nConfirm password (hidden): ");
  const confirmation = await prompt.question("");
  muted = false;
  process.stdout.write("\n");
  if (password.length < 16 || password.length > 1024 || password !== confirmation) throw new Error("Passwords must match and contain 16–1024 characters.");
  const salt = randomBytes(16).toString("hex");
  const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
  let existing = "";
  try { existing = await readFile(".env.local", "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  existing = existing.split(/\r?\n/).filter((line) => !/^ADMIN_(USERNAME|PASSWORD_HASH)=/.test(line)).join("\n").trimEnd();
  await writeFile(".env.local", `${existing}\nADMIN_USERNAME=${username}\nADMIN_PASSWORD_HASH=${hash}\n`, { mode: 0o600 });
  console.log("Staff access configured in ignored .env.local. Restart the server to apply it. Existing sessions will be invalidated.");
} finally { prompt.close(); }
