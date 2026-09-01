import fs from "fs";

const data = JSON.parse(fs.readFileSync("tmp-districts.geojson", "utf8"));

const ID_TO_SLUG = {
  "TR-D-81-001": "akcakoca",
  "TR-D-81-002": "cumayeri",
  "TR-D-81-003": "cilimli",
  "TR-D-81-004": "merkez",
  "TR-D-81-005": "golyaka",
  "TR-D-81-006": "gumusova",
  "TR-D-81-007": "kaynasli",
  "TR-D-81-008": "yigilca",
};

const LABELS = {
  akcakoca: "Akçakoca",
  cumayeri: "Cumayeri",
  cilimli: "Çilimli",
  merkez: "Merkez",
  golyaka: "Gölyaka",
  gumusova: "Gümüşova",
  kaynasli: "Kaynaşlı",
  yigilca: "Yığılca",
};

const WIDTH = 1000;
const HEIGHT = 780;
const PADDING = 24;

function rings(geom) {
  if (geom.type === "Polygon") return geom.coordinates;
  if (geom.type === "MultiPolygon") return geom.coordinates.flat();
  return [];
}

function distToSegment(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = distToSegment(points[i], points[0], points[end]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist > tolerance) {
    const left = simplify(points.slice(0, index + 1), tolerance);
    const right = simplify(points.slice(index), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[end]];
}

const feats = data.features.filter((f) => f.properties.parent_id === "TR-P-81");
let minLon = Infinity;
let minLat = Infinity;
let maxLon = -Infinity;
let maxLat = -Infinity;

for (const f of feats) {
  for (const ring of rings(f.geometry)) {
    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon);
      minLat = Math.min(minLat, lat);
      maxLon = Math.max(maxLon, lon);
      maxLat = Math.max(maxLat, lat);
    }
  }
}

const innerW = WIDTH - PADDING * 2;
const innerH = HEIGHT - PADDING * 2;

function project([lon, lat]) {
  const x = PADDING + ((lon - minLon) / (maxLon - minLon)) * innerW;
  const y = PADDING + ((maxLat - lat) / (maxLat - minLat)) * innerH;
  return [x, y];
}

function ringToPath(ring, tolerance = 0.35) {
  const projected = ring.map(project);
  const simplified = simplify(projected, tolerance);
  const [fx, fy] = simplified[0];
  let d = `M${fx.toFixed(1)},${fy.toFixed(1)}`;
  for (let i = 1; i < simplified.length; i++) {
    d += `L${simplified[i][0].toFixed(1)},${simplified[i][1].toFixed(1)}`;
  }
  d += "Z";
  return d;
}

function centroid(ring) {
  let x = 0;
  let y = 0;
  for (const p of ring) {
    x += p[0];
    y += p[1];
  }
  return [x / ring.length, y / ring.length];
}

const regions = feats
  .map((f) => {
    const slug = ID_TO_SLUG[f.properties.id];
    const ring = rings(f.geometry)[0];
    const projected = ring.map(project);
    const [cx, cy] = centroid(projected);
    return {
      slug,
      label: LABELS[slug],
      d: ringToPath(ring),
      labelX: Number(cx.toFixed(1)),
      labelY: Number(cy.toFixed(1)),
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label, "tr"));

const output = `/** Düzce ilçe sınırları — turkiye-harita-verisi / HDX (EPSG:4326), SVG'ye projekte edildi. */
export const DUZCE_MAP_VIEWBOX = "0 0 ${WIDTH} ${HEIGHT}" as const;

export type DuzceMapRegion = {
  slug: string;
  label: string;
  d: string;
  labelX: number;
  labelY: number;
};

export const DUZCE_MAP_REGIONS: DuzceMapRegion[] = ${JSON.stringify(regions, null, 2)};
`;

fs.writeFileSync("src/lib/duzce-map-paths.ts", output);
console.log(`Wrote ${regions.length} regions to src/lib/duzce-map-paths.ts`);
