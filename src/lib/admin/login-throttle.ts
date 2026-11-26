import "server-only";
import { databaseEnabled, privateDatabase } from "@/lib/supabase/storage";
let failures = 0;
let resetAt = 0;
const key = () => (process.env.ICE_STORAGE_SCOPE || "") + "staff-login";
export async function reserveLoginAttempt() {
  if (databaseEnabled()) {
    const { data, error } = await privateDatabase().rpc("ice_take_login_attempt", { p_key: key() });
    if (error) throw new Error("Staff login limiter unavailable.");
    return data === true;
  }
  if (Date.now() > resetAt) { failures = 0; resetAt = Date.now() + 15 * 60 * 1000; }
  return ++failures <= 5;
}
export async function clearLoginAttempts() {
  if (databaseEnabled()) {
    const { error } = await privateDatabase().from("ice_login_throttles").delete().eq("id", key());
    if (error) throw new Error("Staff login limiter unavailable.");
  } else failures = 0;
}
