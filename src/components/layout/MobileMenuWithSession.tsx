import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";
import { MobileMenu } from "@/components/layout/MobileMenu";

type Social = { href: string; label: string };

type Props = {
  siteName: string;
  logoUrl?: string;
  categories: Array<{ name: string; slug: string }>;
  whatsappNumber: string;
  socials: Social[];
  services?: Array<{ label: string; href: string }>;
  corporate?: Array<{ label: string; href: string }>;
};

export async function MobileMenuWithSession({
  siteName,
  logoUrl,
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
        name: session.user.name?.trim() || "Hesabım",
        image: session.user.image ?? null,
        accountHref: "/hesabim",
        panelHref:
          session.user.role === "ADMIN" || session.user.role === "EDITOR"
            ? panelPathForRole(session.user.role)
            : undefined,
      }
    : { authenticated: false as const };

  return (
    <MobileMenu
      siteName={siteName}
      logoUrl={logoUrl}
      categories={categories}
      whatsappNumber={whatsappNumber}
      account={account}
      socials={socials}
      services={services}
      corporate={corporate}
    />
  );
}
