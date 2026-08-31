import { PageHeader } from "@/components/admin/PageHeader";
import { FormCard } from "@/components/admin/FormCard";
import { TipForm } from "@/components/forms/TipForm";
import { Megaphone } from "lucide-react";

export const metadata = { title: "İhbar Hattı" };

export default function MemberTipPage() {
  return (
    <>
      <PageHeader
        title="İhbar Hattı"
        description="Kimliğinizi paylaşmadan bilgi iletebilirsiniz. İletişim alanı isteğe bağlıdır."
      />
      <FormCard
        title="İhbar formu"
        description="Mesajınız yalnızca yayın ekibine ulaşır."
        Icon={Megaphone}
        className="max-w-2xl"
      >
        <TipForm />
      </FormCard>
    </>
  );
}
