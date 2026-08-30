"use client";

function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

export function VideoEmbed({ url }: { url: string }) {
  const youTubeId = getYouTubeId(url);

  if (youTubeId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded">
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}`}
          title="Video haber"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <video controls className="aspect-video w-full rounded bg-black">
      <source src={url} />
    </video>
  );
}
