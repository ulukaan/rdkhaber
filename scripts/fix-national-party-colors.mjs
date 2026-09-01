import fs from "fs";

let s = fs.readFileSync("src/lib/election-national-data.ts", "utf8");

if (!s.includes("function duel(")) {
  s = s.replace(
    "}\n\n/** NTV 2024 yerel seçim",
    `}

function duel(name: string, partyName: string, votePct: number): CityDuelCandidate {
  return { name, partyName, partyColor: resolvePartyColor(partyName), votePct };
}

/** NTV 2024 yerel seçim`,
  );
}

s = s.replace(
  /\{\s*name:\s*"([^"]+)",\s*partyName:\s*"([^"]+)",\s*partyColor:\s*"#[0-9A-Fa-f]{6}",\s*votePct:\s*([0-9.]+)\s*\}/g,
  'duel("$1", "$2", $3)',
);

s = s.replace(
  /\{\s*partyName:\s*"([^"]+)",\s*partyColor:\s*"#[0-9A-Fa-f]{6}",\s*votes:/g,
  '{ partyName: "$1", partyColor: resolvePartyColor("$1"), votes:',
);

fs.writeFileSync("src/lib/election-national-data.ts", s);
console.log("updated national data");
