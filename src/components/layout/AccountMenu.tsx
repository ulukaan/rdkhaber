import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { panelPathForRole, roleLabel } from "@/lib/role";
import { signOutAction } from "@/actions/auth";

export async function AccountMenu() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Link href="/giris" className="flex items-center gap-1.5 whitespace-nowrap text-ink hover:text-brand">
          <User className="h-4 w-4" />
          Giriş Yap
        </Link>
        <span className="text-border" aria-hidden>
          |
        </span>
        <Link href="/kayit" className="whitespace-nowrap text-ink hover:text-brand">
          Kayıt Ol
        </Link>
      </div>
    );
  }

  const staff = session.user.role === "ADMIN" || session.user.role === "EDITOR";

  return (
    <div className="flex items-center gap-3 text-xs">
      <Link
        href="/hesabim"
        className="flex items-center gap-1.5 font-semibold text-ink hover:text-brand"
        title="Hesabım"
      >
        <User className="h-4 w-4" />
        {session.user.name?.split(" ")[0] ?? "Hesabım"}
      </Link>
      {staff ? (
        <Link
          href={panelPathForRole(session.user.role)}
          className="hidden items-center gap-1 font-semibold text-ink-soft hover:text-brand sm:flex"
          title={roleLabel(session.user.role)}
        >
          <LayoutDashboard className="h-4 w-4" />
          Panel
        </Link>
      ) : null}
      <form action={signOutAction}>
        <button
          type="submit"
          className="flex items-center gap-1 text-ink-soft hover:text-brand"
          title="Çıkış Yap"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
