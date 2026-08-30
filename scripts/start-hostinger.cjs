/**
 * Hostinger runtime: rewrite public MySQL host to loopback.
 * Build workers need srv*.hstgr.io; the live app hangs on hairpin NAT.
 */
const { spawn } = require("node:child_process");

const raw = process.env.DATABASE_URL || "";
if (/@srv\d+\.hstgr\.io:/i.test(raw)) {
  process.env.DATABASE_URL = raw.replace(/@srv\d+\.hstgr\.io:/i, "@127.0.0.1:");
} else if (/@localhost:/i.test(raw)) {
  process.env.DATABASE_URL = raw.replace(/@localhost:/i, "@127.0.0.1:");
}

const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "start"],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
