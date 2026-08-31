import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { readUploadedFile } from "@/lib/upload-path";
import { buildSharePostCopy, type SharePostInput } from "@/lib/share-post";

const WIDTH = 1080;
const HEIGHT = 1350;
const RED = "#d0021b";
const NAVY = "#1b2a4a";
const MUTED = "#6b7280";
const SOFT_RED = "#e35d6a";

type FontPack = { regular: ArrayBuffer; bold: ArrayBuffer; italic: ArrayBuffer };
let fonts: FontPack | null = null;

async function loadFonts(): Promise<FontPack | null> {
  if (fonts) return fonts;
  try {
    const base = "https://cdn.jsdelivr.net/fontsource/fonts/inter@5.2.8";
    const [regular, bold, italic] = await Promise.all([
      fetch(`${base}/latin-ext-400-normal.woff`).then((r) => r.arrayBuffer()),
      fetch(`${base}/latin-ext-700-normal.woff`).then((r) => r.arrayBuffer()),
      fetch(`${base}/latin-ext-400-italic.woff`).then((r) => r.arrayBuffer()),
    ]);
    fonts = { regular, bold, italic };
    return fonts;
  } catch {
    return null;
  }
}

async function localDataUri(relFromPublic: string, mime: string) {
  try {
    const abs = path.join(process.cwd(), "public", relFromPublic);
    const buf = await readFile(abs);
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function mediaDataUri(url: string | null | undefined) {
  if (!url?.trim()) return null;
  const src = url.trim();
  if (src.startsWith("data:")) return src;
  if (src.startsWith("/uploads/")) {
    const file = await readUploadedFile(src);
    if (!file) return null;
    return `data:${file.mime};base64,${file.buffer.toString("base64")}`;
  }
  if (src.startsWith("/")) return localDataUri(src.replace(/^\//, ""), "image/png");
  if (!/^https?:\/\//i.test(src)) return null;
  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 32 || buf.length > 8_000_000) return null;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export type SharePostRenderInput = SharePostInput & {
  coverImageUrl?: string | null;
};

export async function renderSharePostImage(input: SharePostRenderInput) {
  const copy = buildSharePostCopy(input);
  const [pack, logo, photo] = await Promise.all([
    loadFonts(),
    localDataUri("brand/logo.png", "image/png"),
    mediaDataUri(input.coverImageUrl),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: "52px 56px 48px",
          fontFamily: "Inter",
          color: "#111111",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={280} height={72} style={{ objectFit: "contain" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 22, color: MUTED, fontWeight: 700 }}>düzce</div>
              <div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: NAVY, lineHeight: 0.9 }}>
                radikal
              </div>
            </div>
          )}
          <div style={{ display: "flex", fontSize: 26, color: MUTED, fontWeight: 500 }}>{copy.dateLabel}</div>
        </div>

        <div style={{ display: "flex", height: 3, background: RED, marginTop: 22, width: "100%" }} />

        <div
          style={{
            display: "flex",
            marginTop: 28,
            alignSelf: "flex-start",
            background: RED,
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 1.2,
            padding: "8px 16px",
          }}
        >
          {copy.category}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#111",
          }}
        >
          {copy.title}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 26,
            lineHeight: 1.45,
            color: "#222",
            fontWeight: 400,
          }}
        >
          {copy.lead}
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: 28,
            overflow: "hidden",
            background: "#e8eaee",
            minHeight: 360,
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={968} height={520} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          ) : (
            <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 24 }}>
              Düzce Radikal
            </div>
          )}
        </div>

        {copy.whyMain ? (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", color: RED, fontSize: 22, fontWeight: 700, letterSpacing: 1.4 }}>
                NEDEN ÖNEMLİ
              </div>
              <div style={{ display: "flex", flex: 1, height: 2, background: RED, marginLeft: 16 }} />
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 24, lineHeight: 1.45, color: "#111" }}>
              {copy.whyMain}
            </div>
            {copy.whyWatch ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 12,
                  fontSize: 24,
                  lineHeight: 1.45,
                  color: SOFT_RED,
                  fontStyle: "italic",
                }}
              >
                {copy.whyWatch}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: pack
        ? [
            { name: "Inter", data: pack.regular, weight: 400, style: "normal" },
            { name: "Inter", data: pack.bold, weight: 700, style: "normal" },
            { name: "Inter", data: pack.italic, weight: 400, style: "italic" },
          ]
        : undefined,
    },
  );
}
