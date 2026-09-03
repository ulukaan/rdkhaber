import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { panelPathForRole, roleLabel } from "@/lib/role";
import { signOutAction } from "@/actions/auth";

export async function AccountMenu() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/giris"
        className="group relative inline-flex h-9 items-center gap-1.5 overflow-hidden border border-border bg-white px-3 text-[12px] font-extrabold uppercase tracking-wide text-ink transition-colors hover:border-brand hover:text-white"
      >
        <span
          className="absolute inset-y-0 left-0 w-0 bg-brand transition-[width] duration-300 ease-out group-hover:w-full"
          aria-hidden
        />
        <User className="relative z-[1] h-3.5 w-3.5" aria-hidden />
        <span className="relative z-[1]">Giriş Yap</span>
      </Link>
    );
  }

  const staff = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  const firstName = session.user.name?.split(" ")[0] ?? "Hesabım";

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/hesabim"
        className="inline-flex h-9 max-w-[7.5rem] items-center gap-1.5 border border-border bg-white px-2 text-[12px] font-extrabold text-ink transition-colors hover:border-brand hover:text-brand xl:max-w-[9rem] xl:px-2.5"
        title="Hesabım"
      >
        <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{firstName}</span>
      </Link>
      {staff ? (
        <Link
          href={panelPathForRole(session.user.role)}
          className="inline-flex h-9 w-9 items-center justify-center border border-border bg-white text-ink-soft transition-colors hover:border-brand hover:text-brand xl:w-auto xl:gap-1.5 xl:px-2.5"
          title={roleLabel(session.user.role)}
          aria-label="Panel"
        >
          <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden text-[12px] font-extrabold xl:inline">Panel</span>
        </Link>
      ) : null}
      <form action={signOutAction}>
        <button
          type="submit"
          className="inline-flex h-9 w-9 items-center justify-center border border-border bg-white text-ink-soft transition-colors hover:border-brand hover:text-brand"
          title="Çıkış Yap"
          aria-label="Çıkış Yap"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
