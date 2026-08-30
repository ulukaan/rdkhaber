const bases = [
  "https://darkslategrey-kudu-152481.hostingersite.com",
  "https://darkturquoise-dog-786485.hostingersite.com",
];
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json,text/html,*/*",
};

async function main() {
  for (const b of bases) {
    console.log("===", b);
    for (const q of ["radikal", "logo", "143", "duzce"]) {
      try {
        const media = await (
          await fetch(`${b}/wp-json/wp/v2/media?per_page=30&search=${encodeURIComponent(q)}`, {
            headers,
          })
        ).json();
        if (Array.isArray(media)) {
          for (const m of media) {
            console.log(q, m.mime_type, m.source_url);
          }
        } else {
          console.log(q, media?.code || media);
        }
      } catch (e) {
        console.log(q, e.message);
      }
    }
    try {
      const html = await (await fetch(b, { headers })).text();
      const imgs = [
        ...html.matchAll(/https?:\/\/[^"'\\s>]+\.(?:png|jpe?g|svg|webp)/gi),
      ].map((m) => m[0]);
      console.log("page imgs", [...new Set(imgs)].slice(0, 25));
    } catch (e) {
      console.log("html err", e.message);
    }
  }

  // Try known cropped site icon larger sizes as logo fallback
  const candidates = [
    "https://darkslategrey-kudu-152481.hostingersite.com/wp-content/uploads/2025/09/cropped-duzce-radikal-duzce-haberleri-1512025-k2322.png",
    "https://darkslategrey-kudu-152481.hostingersite.com/wp-content/uploads/2025/09/duzce-radikal-duzce-haberleri-1512025-k2322.png",
    "https://darkslategrey-kudu-152481.hostingersite.com/wp-content/uploads/2025/09/cropped-duzce-radikal-duzce-haberleri-1512025-k2322-180x180.png",
  ];
  for (const u of candidates) {
    const res = await fetch(u, { headers });
    const buf = Buffer.from(await res.arrayBuffer());
    console.log(res.status, buf.slice(0, 4).toString("hex"), buf.length, u);
  }
}

main();
