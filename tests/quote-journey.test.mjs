import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";

const origin = new URL(process.env.QUOTE_TEST_ORIGIN || "http://localhost:3001");
const endpoint = new URL("/api/quote-draft", origin);
const details = {
  serviceId: "end-of-lease-cleaning", location: "Sydney NSW 2000",
  property: "apartment", bedrooms: "2", bathrooms: "1",
  furnished: "unfurnished", condition: "standard", preferredDate: "2099-04-20",
  extras: ["carpets"], otherDescription: "", requirements: "Lift access needs to be arranged.",
};
const post = (body, cookie = "", extraHeaders = {}) => fetch(endpoint, {
  method: "POST", headers: { "Content-Type": "application/json", Origin: origin.origin, Cookie: cookie, ...extraHeaders },
  body: JSON.stringify(body),
});
const payload = (value = details, version = 0, complete = true) => ({
  details: value, version, complete,
  sourcePath: "/locations/nsw/suburbs/sydney/end-of-lease-cleaning",
  entryKey: "/locations/nsw/suburbs/sydney/end-of-lease-cleaning|end-of-lease-cleaning|Sydney NSW 2000",
});

test("quote session saves, resumes, isolates, validates and clears without sending enquiries", async () => {
  assert.equal((await (await fetch(endpoint)).json()).draft, null);
  const created = await post(payload());
  assert.equal(created.status, 200);
  const setCookie = created.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=strict/i);
  const cookie = setCookie.split(";")[0];
  try {
    const data = await created.json();
    assert.equal(data.deliveryEnabled, false);
    assert.equal(data.draft.version, 1);
    assert.equal(data.draft.entryKey, payload().entryKey);
    assert.equal(data.draft.localityId, "planning-sydney-nsw");
    assert.deepEqual(data.draft.details, details);
    assert.ok(Date.parse(data.draft.expiresAt) > Date.now() + 23 * 3600000);
    assert.ok(Date.parse(data.draft.expiresAt) <= Date.now() + 24 * 3600000);
    assert.ok(!JSON.stringify(data).includes(cookie.split("=")[1]), "opaque token never returned in payload");

    const resumed = await fetch(endpoint, { headers: { Cookie: cookie } });
    assert.match(resumed.headers.get("cache-control"), /no-store/);
    assert.deepEqual((await resumed.json()).draft.details, details);
    assert.equal((await (await fetch(endpoint)).json()).draft, null, "another browser cannot read this draft");

    const incomplete = await post(payload({ ...details, location: "", bathrooms: "" }, 1), cookie);
    assert.equal(incomplete.status, 422);
    assert.ok((await incomplete.json()).errors.location);
    assert.equal((await post(payload({ ...details, serviceId: "invented-service" }, 1), cookie)).status, 422);
    assert.equal((await post(payload({ ...details, preferredDate: "2099-02-31" }, 1), cookie)).status, 422);
    assert.equal((await post(payload({ ...details, extras: ["invented-extra"] }, 1), cookie)).status, 422);
    assert.equal((await post(payload({ ...details, extras: ["other"], otherDescription: "" }, 1), cookie)).status, 422);
    assert.equal((await post(payload(details, 1), cookie, { Origin: "https://unrelated.example" })).status, 403);
    assert.equal((await post(payload(details, 1), cookie, { "Content-Type": "text/plain" })).status, 415);
    const tooBig = await post({ ...payload(details, 1), padding: "x".repeat(13000) }, cookie);
    assert.equal(tooBig.status, 413);

    const concurrent = await Promise.all([
      post(payload({ ...details, requirements: "First tab" }, 1), cookie),
      post(payload({ ...details, requirements: "Second tab" }, 1), cookie),
    ]);
    assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 409], "stale tabs cannot overwrite newer details");

    assert.equal((await post({ ...payload(details, 2), entryKey: "/bad|invented|private" }, cookie)).status, 400);
    const changed = await post({
      ...payload({ ...details, serviceId: "carpet-cleaning" }, 2),
      sourcePath: "/untrusted-attribution", email: "synthetic@example.invalid",
    }, cookie);
    assert.equal(changed.status, 200);
    const changedDraft = (await changed.json()).draft;
    assert.deepEqual(changedDraft.details.extras, []);
    assert.equal(changedDraft.details.bedrooms, "");
    assert.equal(changedDraft.sourcePath, payload().sourcePath, "first attribution remains stable");
    assert.ok(!JSON.stringify(changedDraft).includes("synthetic@example.invalid"), "contact details are not persisted");

    const submit = await fetch(new URL("/api/quote-submit", origin), { method: "POST" });
    assert.equal(submit.status, 503);
    const blocked = await submit.json();
    assert.equal(blocked.deliveryEnabled, false);
    assert.match(blocked.error, /not been submitted/);
  } finally {
    const removed = await fetch(endpoint, { method: "DELETE", headers: { Origin: origin.origin, Cookie: cookie } });
    assert.equal(removed.status, 200);
  }
  assert.equal((await (await fetch(endpoint, { headers: { Cookie: cookie } })).json()).draft, null);
});

test("studio normalization and partial drafts do not require final quote answers", async () => {
  const response = await post(payload({ ...details, property: "studio", bedrooms: "4", location: "" }, 0, false));
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie").split(";")[0];
  try {
    const data = await response.json();
    assert.equal(data.draft.details.bedrooms, "0");
    assert.equal(data.draft.details.location, "");
  } finally {
    await fetch(endpoint, { method: "DELETE", headers: { Origin: origin.origin, Cookie: cookie } });
  }
});

test("expired local test drafts are not recovered or silently overwritten", async () => {
  const response = await post(payload());
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie").split(";")[0];
  const token = cookie.split("=")[1];
  assert.match(token, /^[a-f0-9]{64}$/);
  // This fixture belongs to this test only. Run against this checkout's local server.
  const filename = createHash("sha256").update(token).digest("hex") + ".json";
  const file = path.join(process.env.QUOTE_DRAFT_DIR || path.join(process.cwd(), ".data", "quote-drafts"), filename);
  try {
    const record = JSON.parse(await readFile(file, "utf8"));
    record.expiresAt = "2000-01-01T00:00:00.000Z";
    await writeFile(file, JSON.stringify(record), { mode: 0o600 });
    assert.equal((await (await fetch(endpoint, { headers: { Cookie: cookie } })).json()).draft, null);
    assert.equal((await post(payload(details, 1), cookie)).status, 409);
    await assert.rejects(readFile(file), { code: "ENOENT" });
  } finally {
    await fetch(endpoint, { method: "DELETE", headers: { Origin: origin.origin, Cookie: cookie } });
  }
});