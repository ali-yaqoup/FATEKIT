export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse font-sans">
      {/* Header Skeleton */}
      <div className="border-b border-neutral-800 pb-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-800" />
          <div className="h-4 w-72 bg-neutral-900" />
        </div>
        <div className="h-9 w-32 bg-neutral-800" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-[#141414] border border-neutral-800 space-y-4">
            <div className="flex justify-between">
              <div className="h-3.5 w-24 bg-neutral-800" />
              <div className="w-8 h-8 bg-neutral-800" />
            </div>
            <div className="h-8 w-32 bg-neutral-800" />
            <div className="h-3 w-40 bg-neutral-900" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#141414] border border-neutral-800 p-6 space-y-4">
        <div className="h-6 w-36 bg-neutral-800 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 bg-neutral-900/60 border border-neutral-800/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
