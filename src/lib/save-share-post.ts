import { prisma } from "@/lib/prisma";
import { writeUploadedFile } from "@/lib/upload-path";
import { autoShareImagePath } from "@/lib/share-post";
import { renderSharePostImage } from "@/lib/share-post-image";

export async function saveGeneratedSharePost(articleId: string) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      summary: true,
      coverImageUrl: true,
      headlineSub: true,
      publishedAt: true,
      imageSocial: true,
      category: { select: { name: true } },
    },
  });
  if (!article) return null;

  const autoPath = autoShareImagePath(article.id);
  const custom = article.imageSocial?.trim();
  if (custom && custom !== autoPath) return custom;

  try {
    const image = await renderSharePostImage({
      title: article.title,
      summary: article.summary,
      categoryName: article.category.name,
      publishedAt: article.publishedAt,
      headlineSub: article.headlineSub,
      coverImageUrl: article.coverImageUrl,
    });
    const buffer = Buffer.from(await image.arrayBuffer());
    const url = await writeUploadedFile(`share/${article.id}.png`, buffer);
    if (article.imageSocial !== url) {
      await prisma.article.update({ where: { id: article.id }, data: { imageSocial: url } });
    }
    return url;
  } catch (err) {
    console.error("[share-post] kart üretilemedi", err);
    return null;
  }
}
