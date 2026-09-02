import { fetchBreakingTickerItems } from "@/lib/breaking-ticker";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await fetchBreakingTickerItems();
  return Response.json(
    { items },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
