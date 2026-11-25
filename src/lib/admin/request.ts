import "server-only";
export async function readAdminForm(request: Request, maxBytes = 12000): Promise<FormData> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded") throw new Error("Unsupported form encoding.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing form.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    length += chunk.value.length;
    if (length > maxBytes) { await reader.cancel(); throw new Error("Request too large."); }
    chunks.push(chunk.value);
  }
  const form = new FormData();
  new URLSearchParams(Buffer.concat(chunks).toString("utf8")).forEach((value, key) => form.append(key, value));
  return form;
}
