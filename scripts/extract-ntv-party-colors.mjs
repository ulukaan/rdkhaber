import fs from "fs";

const s = fs.readFileSync("tmp-ntv-main.js", "utf8");
const matches = [...s.matchAll(/this\.colors=\{[^}]+\}/g)];
for (const m of matches) console.log(m[0]);

const more = [...s.matchAll(/\d+:"#[0-9A-Fa-f]{6}"/g)].map((m) => m[0]);
console.log(
  "all id:color",
  [...new Set(more)].sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).join(", "),
);
