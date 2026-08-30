import { HeadlineDesignPage } from "@/components/admin/pages/HeadlineDesignPage";

export const metadata = { title: "Manşet Tasarımı" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HeadlineDesignPage id={id} cancelHref="/editor/manset" />;
}
