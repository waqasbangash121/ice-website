import assert from "node:assert/strict";

// Run against a started production server: pnpm verify:foundation [base URL].
const origin = new URL(process.argv[2] ?? "http://localhost:3000");
const pages = new Map();
for (const path of ["/", "/services", "/get-a-free-quote"]) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${path}: one H1`);
  assert.match(html, /noindex/, `${path}: development indexation policy`);
  assert.doesNotMatch(html, /Create Next App|Geist/, `${path}: starter content removed`);
  pages.set(path, html);
}
assert.equal((pages.get("/services").match(/<article[\s>]/g) ?? []).length, 12);

for (const [path, html] of pages) {
  for (const match of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
    const url = new URL(match[1], new URL(path, origin));
    if (url.origin !== origin.origin) continue;
    assert.ok(pages.has(url.pathname), `${path}: destination exists: ${url.pathname}`);
    if (url.hash) {
      assert.ok(pages.get(url.pathname).includes(`id="${url.hash.slice(1)}"`), `${path}: anchor exists: ${url.hash}`);
    }
  }
}
const missing = await fetch(new URL("/foundation-missing-page", origin));
assert.equal(missing.status, 404, "unknown routes must return HTTP 404");
assert.match(await missing.text(), /Page Not Found/);
const robots = await fetch(new URL("/robots.txt", origin));
assert.equal(robots.status, 200);
assert.match(await robots.text(), /Disallow: \//);
console.log("Foundation checks passed: pages, 12 services, internal links/anchors, metadata, robots and HTTP 404.");
