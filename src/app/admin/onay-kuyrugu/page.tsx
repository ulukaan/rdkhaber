import { listReviewQueueAction } from "@/actions/article-approval";
import { PageHeader } from "@/components/admin/PageHeader";
import { ReviewQueueTable } from "@/components/admin/ReviewQueueTable";

export const metadata = { title: "Onay kuyruğu" };

export default async function ReviewQueuePage() {
  const items = await listReviewQueueAction();

  return (
    <>
      <PageHeader
        title="Onay kuyruğu"
        description="Editörlerin yayın onayı bekleyen haberleri."
      />
      <ReviewQueueTable items={items} basePath="/admin" />
    </>
  );
}
