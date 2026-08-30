import { getRates } from "@/lib/rates";
import { RatesBarClient } from "@/components/layout/RatesBarClient";

export async function RatesBar() {
  const snapshot = await getRates();
  if (!snapshot) return null;
  return <RatesBarClient groups={snapshot.groups} date={snapshot.date} />;
}
