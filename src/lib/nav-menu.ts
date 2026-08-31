import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { categoryHref, normalizeCategoryHref, resolveCategoryHref } from "@/lib/category-path";

export type NavLocation = "header" | "footer" | "footer_services" | "footer_corporate";

export const NAV_LOCATIONS: NavLocation[] = [
  "header",
  "footer",
  "footer_services",
  "footer_corporate",
];

export type NavLink = {
  id?: string;
  label: string;
  href: string;
  visible?: boolean;
  order?: number;
  children?: NavLink[];
};

export type NavEditItem = {
  label: string;
  href: string;
  visible: boolean;
  children?: NavEditItem[];
};

function toTree(
  rows: Array<{
    id: string;
    label: string;
    href: string;
    visible: boolean;
    order: number;
    parentId: string | null;
  }>,
  onlyVisible: boolean,
): NavLink[] {
  const byParent = new Map<string | null, typeof rows>();
  for (const row of rows) {
    if (onlyVisible && !row.visible) continue;
    const key = row.parentId;
    const list = byParent.get(key) ?? [];
    list.push(row);
    byParent.set(key, list);
  }

  const build = (parentId: string | null): NavLink[] => {
    const list = (byParent.get(parentId) ?? []).sort((a, b) => a.order - b.order);
    return list.map((row) => {
      const children = build(row.id);
      return {
        id: row.id,
        label: row.label,
        href: resolveCategoryHref(normalizeCategoryHref(row.href)),
        visible: row.visible,
        order: row.order,
        ...(children.length > 0 ? { children } : {}),
      };
    });
  };

  return build(null);
}

export const getNavItems = cache((location: NavLocation): Promise<NavLink[]> =>
  unstable_cache(
    async () => {
      try {
        const rows = await prisma.navItem.findMany({
          where: { location },
          orderBy: { order: "asc" },
        });
        if (rows.length > 0) {
          return toTree(rows, true);
        }
      } catch {
        // Client henüz generate edilmediyse veya tablo yoksa varsayılan menü.
      }
      return getDefaultNav(location);
    },
    ["nav-items", location],
    { revalidate: 300, tags: [CACHE_TAGS.nav] },
  )(),
);

export async function getNavItemsForEdit(location: NavLocation): Promise<NavEditItem[]> {
  try {
    const rows = await prisma.navItem.findMany({
      where: { location },
      orderBy: { order: "asc" },
    });
    if (rows.length > 0) {
      return toTree(rows, false).map(toEditItem);
    }
  } catch {
    // Client henüz generate edilmediyse veya tablo yoksa varsayılan menü.
  }
  return (await getDefaultNav(location)).map(toEditItem);
}

function toEditItem(item: NavLink): NavEditItem {
  return {
    label: item.label,
    href: item.href,
    visible: item.visible ?? true,
    children: (item.children ?? []).map(toEditItem),
  };
}

export function flattenNavLinks(items: NavLink[]): Array<{ label: string; href: string }> {
  return items.flatMap((item) => [
    { label: item.label, href: item.href },
    ...(item.children ?? []).map((child) => ({
      label: child.label,
      href: child.href,
    })),
  ]);
}

export async function getDefaultNav(location: NavLocation): Promise<NavLink[]> {
  if (location === "footer_services") {
    return [
      { label: "Yayın Akışı", href: "/yayin-akisi", visible: true, order: 0 },
      { label: "Burçlar", href: "/burclar", visible: true, order: 1 },
      { label: "TarifPark", href: "https://tarifpark.com/", visible: true, order: 2 },
      { label: "Video Haberler", href: "/video-haberler", visible: true, order: 3 },
      { label: "Foto Galeri", href: "/foto-galeri", visible: true, order: 4 },
      { label: "Haber Gönder", href: "/haber-gonder", visible: true, order: 5 },
      { label: "İhbar Hattı", href: "/ihbar-hatti", visible: true, order: 6 },
    ];
  }

  if (location === "footer_corporate") {
    return [
      { label: "İletişim", href: "/iletisim", visible: true, order: 0 },
      { label: "Künye", href: "/sayfa/kunye", visible: true, order: 1 },
      { label: "Gizlilik", href: "/sayfa/gizlilik", visible: true, order: 2 },
      { label: "KVKK", href: "/sayfa/kvkk", visible: true, order: 3 },
      { label: "Çerezler", href: "/cerezler", visible: true, order: 4 },
      { label: "Kullanım Şartları", href: "/sayfa/kullanim-kosullari", visible: true, order: 5 },
    ];
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { name: true, slug: true },
  });

  if (location === "header") {
    return [
      { label: "Anasayfa", href: "/", visible: true, order: 0 },
      ...categories.map((c, i) => ({
        label: c.name,
        href: categoryHref(c.slug),
        visible: true,
        order: i + 1,
      })),
      { label: "Video", href: "/video-haberler", visible: true, order: categories.length + 1 },
      { label: "Yayın Akışı", href: "/yayin-akisi", visible: true, order: categories.length + 2 },
      { label: "Burçlar", href: "/burclar", visible: true, order: categories.length + 3 },
    ];
  }

  // footer — kategoriler sütunu
  return [
    ...categories.slice(0, 8).map((c, i) => ({
      label: c.name,
      href: categoryHref(c.slug),
      visible: true,
      order: i,
    })),
  ];
}

export async function replaceNavItems(location: NavLocation, items: NavEditItem[]) {
  await prisma.$transaction(async (tx) => {
    // Önce alt öğeler, sonra üst öğeler — FK / cascade karışıklığını önler.
    await tx.navItem.deleteMany({ where: { location, parentId: { not: null } } });
    await tx.navItem.deleteMany({ where: { location, parentId: null } });

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]!;
      const parent = await tx.navItem.create({
        data: {
          location,
          label: item.label.trim(),
          href: normalizeCategoryHref(item.href.trim() || "/"),
          visible: item.visible,
          order: i,
        },
      });
      const children = item.children ?? [];
      for (let j = 0; j < children.length; j += 1) {
        const child = children[j]!;
        await tx.navItem.create({
          data: {
            location,
            label: child.label.trim(),
            href: normalizeCategoryHref(child.href.trim() || "/"),
            visible: child.visible,
            order: j,
            parentId: parent.id,
          },
        });
      }
    }
  });
}

function navHrefEquals(href: string, target: string) {
  return normalizeCategoryHref(href) === normalizeCategoryHref(target);
}

/** Üst menüde bu kategori var mı? (üst veya alt öğe) */
export function headerNavContainsSlug(items: NavEditItem[], slug: string) {
  const target = categoryHref(slug);
  for (const item of items) {
    if (navHrefEquals(item.href, target)) return true;
    for (const child of item.children ?? []) {
      if (navHrefEquals(child.href, target)) return true;
    }
  }
  return false;
}

export function collectHeaderNavSlugs(items: NavEditItem[]) {
  const slugs = new Set<string>();
  for (const item of items) {
    const parentSlug = item.href.replace(/^\/+/, "").split("/")[0];
    if (parentSlug) slugs.add(parentSlug);
    for (const child of item.children ?? []) {
      const childSlug = child.href.replace(/^\/+/, "").split("/")[0];
      if (childSlug) slugs.add(childSlug);
    }
  }
  return slugs;
}

/**
 * Kategoriyi üst menüye ekler veya çıkarır.
 * Alt kategoriyse mümkünse üst kategorinin altına eklenir.
 */
export async function toggleCategoryInHeaderNav(category: {
  name: string;
  slug: string;
  parent?: { slug: string; name: string } | null;
}) {
  const items = await getNavItemsForEdit("header");
  const target = categoryHref(category.slug);

  // Çıkar
  let removed = false;
  const without: NavEditItem[] = [];
  for (const item of items) {
    if (navHrefEquals(item.href, target)) {
      removed = true;
      continue;
    }
    const children = (item.children ?? []).filter((c) => {
      if (navHrefEquals(c.href, target)) {
        removed = true;
        return false;
      }
      return true;
    });
    without.push({ ...item, children });
  }
  if (removed) {
    await replaceNavItems("header", without);
    return { inNav: false };
  }

  // Ekle — parent menüde varsa altına
  const parentSlug = category.parent?.slug;
  const nestUnder =
    parentSlug === "siyasi-partiler" ||
    parentSlug === "bolge" ||
    parentSlug === "bolge-kategorileri"
      ? parentSlug === "bolge-kategorileri"
        ? ["bolge", "bolge-kategorileri"]
        : [parentSlug]
      : parentSlug
        ? [parentSlug]
        : [];

  const next = without.map((item) => ({ ...item, children: [...(item.children ?? [])] }));
  let nested = false;
  if (nestUnder.length > 0) {
    for (const candidate of nestUnder) {
      const idx = next.findIndex((item) => navHrefEquals(item.href, categoryHref(candidate)));
      if (idx >= 0) {
        next[idx]!.children = [
          ...(next[idx]!.children ?? []),
          { label: category.name, href: target, visible: true },
        ];
        nested = true;
        break;
      }
    }
  }

  // Partiler için "Siyasi Partiler" etiketi / siyaset menüsü
  if (!nested && /parti/i.test(category.slug)) {
    const idx = next.findIndex(
      (item) =>
        navHrefEquals(item.href, "/siyasi-partiler") ||
        /siyasi\s*parti/i.test(item.label) ||
        navHrefEquals(item.href, "/siyaset"),
    );
    if (idx >= 0) {
      next[idx]!.children = [
        ...(next[idx]!.children ?? []),
        { label: category.name, href: target, visible: true },
      ];
      nested = true;
    }
  }

  if (!nested) {
    next.push({
      label: category.name,
      href: target,
      visible: true,
      children: [],
    });
  }

  await replaceNavItems("header", next);
  return { inNav: true };
}
