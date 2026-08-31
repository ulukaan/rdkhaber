import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";
import { MobileMenu } from "@/components/layout/MobileMenu";

type Social = { href: string; label: string };

type Props = {
  categories: Array<{ name: string; slug: string }>;
  whatsappNumber: string;
  socials: Social[];
};

export async function MobileMenuWithSession({ categories, whatsappNumber, socials }: Props) {
  const session = await auth();

  const account = session?.user
    ? {
        authenticated: true as const,
        name: session.user.name?.split(" ")[0] ?? "Hesabım",
        panelHref: panelPathForRole(session.user.role),
      }
    : { authenticated: false as const };

  return (
    <MobileMenu
      categories={categories}
      whatsappNumber={whatsappNumber}
      account={account}
      socials={socials}
    />
  );
}
