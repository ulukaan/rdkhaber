import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContentComplaintForm } from "@/components/forms/ContentComplaintForm";

export const metadata = {
  title: "İçerik şikayeti",
  description: "Haber içeriği hakkında düzeltme veya kaldırma talebi.",
};

export default function ComplaintPage() {
  return (
    <Container className="py-8">
      <SectionHeading title="İçerik şikayeti ve düzeltme talebi" />
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Kişisel verileriniz, telif veya içerik doğruluğu hakkındaki taleplerinizi bu form ile iletebilirsiniz.
      </p>
      <div className="max-w-xl">
        <ContentComplaintForm />
      </div>
    </Container>
  );
}
