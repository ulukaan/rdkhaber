import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const prisma = new PrismaClient();

const SERVICE_LINKS = [
  { label: "Nöbetçi Eczane", href: "/eczane", order: 0 },
  { label: "Trafik Haritası", href: "/trafik", order: 1 },
  { label: "Vefat Edenler", href: "/vefat", order: 2 },
  { label: "İmsakiye", href: "/imsakiye", order: 3 },
  { label: "Duyurular", href: "/duyurular", order: 4 },
];

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("ensure-service-nav");
    return;
  }

  for (const link of SERVICE_LINKS) {
    const existing = await prisma.navItem.findFirst({
      where: { location: "footer_services", href: link.href },
    });
    if (existing) continue;

    await prisma.navItem.create({
      data: {
        location: "footer_services",
        label: link.label,
        href: link.href,
        visible: true,
        order: link.order,
      },
    });
  }

  console.log("Service nav links ready");
}

main()
  .catch((err) => {
    console.error("ensure-service-nav skipped:", err?.message ?? err);
  })
  .finally(() => prisma.$disconnect());
