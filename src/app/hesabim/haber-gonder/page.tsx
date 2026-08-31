import { Camera, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormCard } from "@/components/admin/FormCard";
import { NewsSubmissionForm } from "@/components/forms/NewsSubmissionForm";

export const metadata = { title: "Haber Gönder" };

export default function MemberSubmitNewsPage() {
  return (
    <>
      <PageHeader
        title="Haber Gönder"
        description="Çevrenizdeki gelişmeyi bize iletin. Editörlerimiz inceler, uygunsa yayınlar."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <FormCard title="Haber formu" description="Başlık, metin ve varsa fotoğraf / video.">
          <NewsSubmissionForm loggedIn />
        </FormCard>

        <div className="space-y-4">
          <FormCard title="Nasıl işler?" Icon={CheckCircle2}>
            <ol className="space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>
                <span className="font-semibold text-ink">1.</span> Başlık ve metni yazın
              </li>
              <li>
                <span className="font-semibold text-ink">2.</span> Fotoğraf veya video ekleyin
              </li>
              <li>
                <span className="font-semibold text-ink">3.</span> Durumu Haberlerim sayfasından takip edin
              </li>
            </ol>
          </FormCard>
          <FormCard title="Medya ipuçları" Icon={Camera}>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>• Net, orijinal görseller tercih edilir</li>
              <li>• Videolar kısa ve anlaşılır olsun</li>
              <li>• Kişisel verileri bozmadan paylaşın</li>
            </ul>
          </FormCard>
        </div>
      </div>
    </>
  );
}
