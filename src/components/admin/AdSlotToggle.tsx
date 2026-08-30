"use client";

import { useTransition } from "react";
import { toggleAdActiveAction } from "@/actions/ad";
import { StatusToggle } from "@/components/admin/StatusToggle";

export function AdSlotToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();

  return (
    <StatusToggle
      active={active}
      disabled={pending}
      title={active ? "Yayından kaldır" : "Yayına al"}
      onClick={() => start(() => { void toggleAdActiveAction(id); })}
    />
  );
}
