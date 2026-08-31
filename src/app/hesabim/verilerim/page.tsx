import { PrivacyDataPanel } from "@/components/account/PrivacyDataPanel";

export const metadata = { title: "Verilerim" };

export default function PrivacyPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold text-ink">Verilerim</h1>
      <p className="mb-6 text-sm text-ink-soft">
        KVKK kapsamında kişisel verilerinizi dışa aktarın veya hesabınızı pasifleştirin.
      </p>
      <PrivacyDataPanel />
    </div>
  );
}
