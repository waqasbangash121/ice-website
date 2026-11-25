import test from "node:test";
import assert from "node:assert/strict";
import { assignBlock, hideLayer, moveLayer, readBuilderDrag } from "../src/lib/blocks/builder-model.ts";

const page = {
  id: "test-page", template: "custom", path: "/test", serviceId: "", title: "Test", description: "Test", intent: "Test",
  placements: [
    { slot: "intro", type: "B01", ref: "intro-record", enabled: true },
    { slot: "first", type: "B21", ref: "first-record", enabled: true },
    { slot: "second", type: "B21", ref: "second-record", enabled: true },
    { slot: "optional", type: "B15", ref: "", enabled: false },
    { slot: "handoff", type: "B17", ref: "handoff-record", enabled: true },
  ],
};
test("reordering identifies repeated types by slot and preserves pinned reading order", () => {
  assert.deepEqual(moveLayer(page, "second", "first").placements.map((slot) => slot.slot), ["intro", "second", "first", "optional", "handoff"]);
  assert.equal(moveLayer(page, "first", "intro"), page);
  assert.equal(moveLayer(page, "first", "handoff"), page);
  assert.equal(moveLayer(page, "missing", "first"), page);
  assert.equal(page.placements[1].slot, "first");
});
test("a library drop only fills compatible slots and optional sections can be restored", () => {
  assert.equal(assignBlock(page, "first", { id: "faq", type: "B15" }), page);
  const assigned = assignBlock(page, "optional", { id: "faq", type: "B15" });
  assert.deepEqual(assigned.placements[3], { slot: "optional", type: "B15", ref: "faq", enabled: true });
  const slots = [{ id: "intro", rule: "R" }, { id: "first", rule: "R" }, { id: "optional", rule: "O" }];
  assert.equal(hideLayer(page, "intro", slots), page);
  assert.equal(hideLayer(assigned, "optional", slots).placements[3].enabled, false);
});
test("foreign, malformed and unknown drag payloads are ignored", () => {
  assert.equal(readBuilderDrag("not json", page.id), null);
  assert.equal(readBuilderDrag(JSON.stringify({ pageId: "another-page", kind: "slot", id: "first" }), page.id), null);
  assert.equal(readBuilderDrag(JSON.stringify({ pageId: page.id, kind: "script", id: "first" }), page.id), null);
  assert.deepEqual(readBuilderDrag(JSON.stringify({ pageId: page.id, kind: "block", id: "faq" }), page.id), { pageId: page.id, kind: "block", id: "faq" });
});
