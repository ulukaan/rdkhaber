import Link from "next/link";
import { Camera, CheckCircle2, Megaphone, Send, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { NewsSubmissionForm } from "@/components/forms/NewsSubmissionForm";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { auth } from "@/auth";

export const metadata = { title: "Haber Gönder" };

export default async function SubmitNewsPage() {
  const session = await auth();

  return (
    <>
      <StaticPageHeader
        title="Haber Gönder"
        eyebrow="Okuyucu masası"
        description="Çevrenizdeki gelişmeyi bize iletin. Fotoğraf ve video ekleyebilirsiniz; editörlerimiz inceler."
      />
      <Container className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="border border-border bg-white p-5 sm:p-7">
            {session?.user ? (
              <p className="mb-5 flex items-center gap-2 border border-border bg-surface px-3 py-2 text-sm text-ink">
                <UserRound className="h-4 w-4 text-brand" aria-hidden />
                <span>
                  <span className="font-semibold">{session.user.name}</span> olarak gönderiyorsunuz
                </span>
              </p>
            ) : null}
            <NewsSubmissionForm loggedIn={Boolean(session?.user)} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
                <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden />
                Nasıl işler?
              </h2>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                <li>
                  <span className="font-semibold text-ink">1.</span> Başlık ve metni yazın
                </li>
                <li>
                  <span className="font-semibold text-ink">2.</span> Fotoğraf veya video ekleyin
                </li>
                <li>
                  <span className="font-semibold text-ink">3.</span> Editörlerimiz inceler, uygunsa
                  yayınlar
                </li>
              </ol>
            </div>

            <div className="border border-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
                <Camera className="h-4 w-4 text-brand" aria-hidden />
                Medya ipuçları
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>• Net, orijinal görseller tercih edilir</li>
                <li>• Videolar kısa ve anlaşılır olsun</li>
                <li>• Kişisel verileri bozmadan paylaşın</li>
              </ul>
            </div>

            <Link
              href="/ihbar-hatti"
              className="flex items-center gap-2 border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              <Megaphone className="h-4 w-4 text-brand" aria-hidden />
              Kimliğimi gizlemek istiyorum → İhbar Hattı
            </Link>

            {!session?.user ? (
              <p className="px-1 text-xs leading-relaxed text-ink-soft">
                <Link href="/giris" className="font-semibold text-brand hover:underline">
                  Giriş yaparsanız
                </Link>{" "}
                gönderilerinizi hesabınızdan takip edebilirsiniz.
              </p>
            ) : (
              <Link
                href="/hesabim/haberlerim"
                className="flex items-center gap-2 px-1 text-sm font-semibold text-ink-soft hover:text-brand"
              >
                <Send className="h-4 w-4" aria-hidden />
                Gönderdiğim haberler
              </Link>
            )}
          </aside>
        </div>
      </Container>
    </>
  );
}
