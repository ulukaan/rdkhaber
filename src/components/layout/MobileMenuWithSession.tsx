import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";
import { MobileMenu } from "@/components/layout/MobileMenu";

type Social = { href: string; label: string };

type Props = {
  categories: Array<{ name: string; slug: string }>;
  whatsappNumber: string;
  socials: Social[];
  services?: Array<{ label: string; href: string }>;
  corporate?: Array<{ label: string; href: string }>;
};

export async function MobileMenuWithSession({
  categories,
  whatsappNumber,
  socials,
  services,
  corporate,
}: Props) {
  const session = await auth();

  const account = session?.user
    ? {
        authenticated: true as const,
        name: session.user.name?.split(" ")[0] ?? "Hesabım",
        accountHref: "/hesabim",
        panelHref:
          session.user.role === "ADMIN" || session.user.role === "EDITOR"
            ? panelPathForRole(session.user.role)
            : undefined,
      }
    : { authenticated: false as const };

  return (
    <MobileMenu
      categories={categories}
      whatsappNumber={whatsappNumber}
      account={account}
      socials={socials}
      services={services}
      corporate={corporate}
    />
  );
}
