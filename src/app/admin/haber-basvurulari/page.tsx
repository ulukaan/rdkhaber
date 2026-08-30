import { SubmissionInboxPage } from "@/components/admin/pages/SubmissionInboxPage";

export const metadata = { title: "Okuyucu Haberleri" };

export default function Page() {
  return <SubmissionInboxPage basePath="/admin" />;
}
