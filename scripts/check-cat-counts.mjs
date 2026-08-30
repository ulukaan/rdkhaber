import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const cats = await p.category.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      parent: { select: { slug: true } },
      _count: { select: { articles: true } },
    },
  });
  for (const c of cats) {
    console.log(
      String(c._count.articles).padStart(3),
      ("/" + c.slug).padEnd(36),
      c.name,
      c.parent?.slug ? `(parent=${c.parent.slug})` : "",
    );
  }
  const settings = await p.setting.findMany({
    where: {
      key: {
        in: ["categoryCardSlugs", "showCategoryCards", "categorySpotlightSlugs"],
      },
    },
  });
  console.log("---settings---");
  for (const s of settings) console.log(s.key, "=", s.value);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
