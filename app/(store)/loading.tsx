export default function StoreLoading() {
  return (
    <div className="bg-background text-on-background min-h-screen animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="px-6 md:px-16 py-12 md:py-16 text-center border-b border-neutral-200 bg-white">
        <div className="h-10 w-48 bg-neutral-200 mx-auto mb-4" />
        <div className="h-4 w-32 bg-neutral-100 mx-auto" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="px-6 md:px-16 py-16 max-w-container mx-auto">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Skeleton */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
            <div className="h-6 w-24 bg-neutral-200 mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-36 bg-neutral-100" />
              <div className="h-4 w-28 bg-neutral-100" />
              <div className="h-4 w-32 bg-neutral-100" />
              <div className="h-4 w-20 bg-neutral-100" />
            </div>
            <div className="h-px bg-neutral-200 my-6" />
            <div className="h-6 w-20 bg-neutral-200 mb-4" />
            <div className="h-10 bg-neutral-100" />
          </aside>

          {/* Product Grid Skeleton */}
          <main className="flex-grow">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-200">
              <div className="h-4 w-40 bg-neutral-200" />
              <div className="h-8 w-32 bg-neutral-100" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="w-full aspect-[3/4] bg-neutral-200 border border-neutral-300" />
                  <div className="h-4 w-3/4 bg-neutral-200" />
                  <div className="h-3 w-1/2 bg-neutral-100" />
                  <div className="h-4 w-1/3 bg-neutral-200" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
