import { Container } from "@/components/ui/Container";
import { NewsletterUnsubscribeForm } from "@/components/forms/NewsletterUnsubscribeForm";

export const metadata = { title: "Bülten aboneliği" };

export default async function NewsletterOptOutPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-extrabold text-ink">Bülten aboneliği</h1>
        <div className="mt-6">
          <NewsletterUnsubscribeForm token={token} />
        </div>
      </div>
    </Container>
  );
}
