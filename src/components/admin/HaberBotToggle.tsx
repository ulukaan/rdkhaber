"use client";

import { useTransition } from "react";
import { StatusToggle } from "@/components/admin/StatusToggle";

type ToggleAction = (id: string) => Promise<{ error?: string } | undefined | void>;

export function HaberBotToggle({
  id,
  active,
  action,
}: {
  id: string;
  active: boolean;
  action: ToggleAction;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <StatusToggle
      active={active}
      onLabel="Açık"
      offLabel="Kapalı"
      disabled={pending}
      onClick={() => startTransition(() => { void action(id); })}
    />
  );
}
