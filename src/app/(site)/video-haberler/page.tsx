import { getVideoArticles } from "@/lib/articles";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoCard } from "@/components/news/VideoCard";

export const metadata = { title: "Video Haberler" };

export default async function VideoNewsPage() {
  const videos = await getVideoArticles(24);

  return (
    <Container className="py-6">
      <SectionHeading title="Video Haberler" as="h1" />
      {videos.length === 0 ? (
        <p className="text-ink-soft">Henüz video haber bulunmuyor.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((a) => (
            <VideoCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </Container>
  );
}
