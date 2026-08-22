import { redirect } from "next/navigation";


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
