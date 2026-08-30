const SOURCE = "https://darkslategrey-kudu-152481.hostingersite.com";

async function main() {
  const html = await (await fetch(SOURCE)).text();
  const icons = [...html.matchAll(/rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/gi)].map(
    (m) => m[1],
  );
  const logos = [
    ...html.matchAll(/custom-logo[^>]*src=["']([^"']+)["']/gi),
    ...html.matchAll(/class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/gi),
    ...html.matchAll(/src=["']([^"']*logo[^"']*\.(?:png|jpg|svg|webp))["']/gi),
  ].map((m) => m[1]);
  console.log("icons:", icons.slice(0, 5));
  console.log("logos:", [...new Set(logos)].slice(0, 10));

  try {
    const media = await (
      await fetch(`${SOURCE}/wp-json/wp/v2/media?search=logo&per_page=10`)
    ).json();
    if (Array.isArray(media)) {
      for (const m of media) {
        console.log("media:", m.source_url, m.title?.rendered);
      }
    }
  } catch (e) {
    console.log("media err", e.message);
  }

  try {
    const siteIcon = await (
      await fetch(`${SOURCE}/wp-json/wp/v2/settings`)
    ).json();
    console.log("settings keys", Object.keys(siteIcon).slice(0, 20));
  } catch {}
}

main();
