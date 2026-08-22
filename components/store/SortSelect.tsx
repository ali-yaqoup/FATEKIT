"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      id="sort-select"
      value={currentSort}
      onChange={handleSortChange}
      className="bg-transparent border-0 font-sans text-xs text-black focus:ring-0 cursor-pointer font-medium"
    >
      <option value="newest">الأحدث</option>
      <option value="price-asc">السعر: من الأقل للأعلى</option>
      <option value="price-desc">السعر: من الأعلى للأقل</option>
    </select>
  );
}
