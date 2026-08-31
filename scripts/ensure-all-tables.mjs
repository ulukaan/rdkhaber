import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const scripts = [
  "ensure-mailbox-table.mjs",
  "ensure-profile-tables.mjs",
  "ensure-platform-tables.mjs",
];

async function runScript(name) {
  await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(dir, name)], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", () => resolve());
  });
}

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("ensure-all-tables");
    return;
  }

  for (const script of scripts) {
    await runScript(script);
  }
}

main().catch((err) => {
  console.error("ensure-all-tables skipped:", err?.message ?? err);
});
