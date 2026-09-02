"use client";

import { useTransition } from "react";
import { toggleCompanyActiveAction } from "@/actions/company";
import { StatusToggle } from "@/components/admin/StatusToggle";

export function CompanyActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();

  return (
    <StatusToggle
      active={active}
      disabled={pending}
      onLabel="Vitrinde"
      offLabel="Gizli"
      title={active ? "Vitrinden kaldır" : "Vitrine al"}
      onClick={() => start(() => { void toggleCompanyActiveAction(id); })}
    />
  );
}
