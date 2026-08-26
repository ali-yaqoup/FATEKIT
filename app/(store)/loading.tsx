export default function StoreLoading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="h-[50vh] min-h-[400px] bg-blush/60 animate-pulse" />

      <div className="store-container store-section">
        <div className="text-center space-y-3 mb-12">
          <div className="h-3 w-32 bg-blush mx-auto animate-pulse rounded-full" />
          <div className="h-10 w-64 bg-blush mx-auto animate-pulse rounded-lg" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="w-full aspect-[3/4] bg-blush/70 rounded-xl" />
              <div className="h-3 w-1/3 bg-blush/50 rounded" />
              <div className="h-4 w-3/4 bg-blush/70 rounded" />
              <div className="h-4 w-1/4 bg-blush/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
