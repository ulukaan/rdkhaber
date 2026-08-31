import { prisma } from "@/lib/prisma";

export async function createNotification(input: {
  userId: string;
  title: string;
  body: string;
  href?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title.slice(0, 180),
      body: input.body.slice(0, 2000),
      href: input.href?.slice(0, 500) ?? null,
    },
  });
}

export async function notifyAdmins(input: { title: string; body: string; href?: string }) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", active: true },
    select: { id: true },
  });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        title: input.title,
        body: input.body,
        href: input.href,
      }),
    ),
  );
}
