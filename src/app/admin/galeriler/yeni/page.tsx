import { PageHeader } from "@/components/admin/PageHeader";
import { GalleryForm } from "@/components/admin/GalleryForm";

export const metadata = { title: "Yeni Galeri" };

export default function NewGalleryPage() {
  return (
    <>
      <PageHeader title="Yeni Galeri" />
      <GalleryForm />
    </>
  );
}
