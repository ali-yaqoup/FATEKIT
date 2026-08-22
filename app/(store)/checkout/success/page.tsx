import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export default async function OrderSuccessRedirectPage({ searchParams }: SuccessPageProps) {
  const { orderNumber } = await searchParams;

  if (orderNumber) {
    redirect(`/order/${orderNumber}`);
  }

  redirect("/shop");
}
