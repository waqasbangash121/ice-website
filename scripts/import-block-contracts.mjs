import { readFile, writeFile } from "node:fs/promises";
// Deterministic extraction from the supplied architecture; never executes reference content.
const source = (await readFile("docs/reference/architecture-source.txt", "utf8")).replaceAll("\r", "");
const registry = source.split("Reusable block registry — 44 blocks")[1].split("Shared layout, content and technical contract")[0];
const blocks = [...registry.matchAll(/\n([GB]\d{2})\n([^\n]+)\n([^\n]+)\n([^\n]+)/g)].map(([, id, name, contract]) => ({ id, name, contract }));
const sections = source.slice(source.indexOf("Detailed sections for all 20 templates"));
const templates = [...sections.matchAll(/\n(A\d{2})\n([\s\S]*?)(?=\nA\d{2}\n|$)/g)].slice(0, 20).map(([, id, section]) => ({
  id,
  placements: [...section.split("\nSpecification\n")[0].matchAll(/\n(\d+)\n(B\d{2}) · ([^\n]+)\n([RCO])\n([^\n]+)/g)].map(([, order, block, , rule, contract]) => ({ order: Number(order), block, rule, contract })),
}));
if (blocks.length !== 44 || templates.length !== 20 || templates.some((template) => !template.placements.length)) throw new Error("Reference extraction failed; inspect the source format.");
await writeFile("src/config/block-contracts.json", JSON.stringify({ source: "docs/reference/architecture-source.txt", blocks, templates }, null, 2) + "\n");
console.log(`Extracted ${blocks.length} block contracts and ${templates.length} template specifications.`);
