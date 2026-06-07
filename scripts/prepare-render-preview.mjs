import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const serverDir = join(process.cwd(), "dist", "server");
const expectedEntry = join(serverDir, "server.js");
const candidates = [
  join(serverDir, "index.js"),
  join(serverDir, "assets", "server.js"),
];

if (!existsSync(expectedEntry)) {
  const source = candidates.find((candidate) => existsSync(candidate));
  if (source) {
    mkdirSync(dirname(expectedEntry), { recursive: true });
    copyFileSync(source, expectedEntry);
    console.log(`Prepared Render preview server entry: ${source} -> ${expectedEntry}`);
  } else {
    console.warn("Render preview server entry was not created because no server build entry was found.");
  }
}
