import { prisma } from "@/lib/prisma";
import { writeUploadedFile } from "@/lib/upload-path";
import { autoShareImagePath, resolveShareCardPhoto } from "@/lib/share-post";
import { renderSharePostImage } from "@/lib/share-post-image";

export async function saveGeneratedSharePost(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      summary: true,
      coverImageUrl: true,
      imageMainHeadline: true,
      imageFiveHeadline: true,
      headlineSub: true,
      publishedAt: true,
      imageSocial: true,
      category: { select: { name: true } },
    },
  });
  if (!article) return null;

  const autoPath = autoShareImagePath(article.id);
  const custom = article.imageSocial?.trim();
  // Kullanıcı kendi paylaşım fotoğrafını seçtiyse onu kart şablonuna bas (üzerine yazma).
  // Özel görsel yoksa otomatik kart PNG üretilir.
  const photoUrl = resolveShareCardPhoto(article);

  try {
    const image = await renderSharePostImage({
      title: article.title,
      summary: article.summary,
      categoryName: article.category.name,
      publishedAt: article.publishedAt,
      headlineSub: article.headlineSub,
      coverImageUrl: photoUrl,
    });
    const buffer = Buffer.from(await image.arrayBuffer());
    const url = await writeUploadedFile(`share/${article.id}.png`, buffer);
    // Özel foto seçiliyse imageSocial alanını ezme — sadece otomatik yoldaysa güncelle
    if (!custom || custom === autoPath || custom.includes("/uploads/share/")) {
      if (article.imageSocial !== url) {
        await prisma.article.update({ where: { id: article.id }, data: { imageSocial: url } });
      }
    }
    return url;
  } catch (err) {
    console.error("[share-post] kart üretilemedi", err);
    return null;
  }
}
