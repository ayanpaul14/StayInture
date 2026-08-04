// Next.js shows this automatically during navigation into /explore and on
// hard reloads, BEFORE the page component's own JS has hydrated - this is
// what stops the "content disappears then pops back in" flash on refresh.
export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
      {/* hero placeholder */}
      <div className="mb-6 sm:mb-8">
        <div className="h-8 w-72 animate-pulse rounded-lg bg-black/5 sm:h-10 sm:w-96" />
        <div className="mt-3 h-4 w-56 animate-pulse rounded bg-black/5" />
      </div>

      {/* search bar placeholder */}
      <div className="mb-4 h-11 w-full animate-pulse rounded-full border border-black/5 bg-black/5" />

      {/* filter bar placeholder */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/90 p-3.5 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-14 animate-pulse rounded-full bg-black/5" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-black/5" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-black/5" />
          <div className="h-9 w-16 animate-pulse rounded-full bg-black/5" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-40 animate-pulse rounded-full bg-black/5" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-black/5" />
        </div>
      </div>

      {/* grid placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-black/5" />
        ))}
      </div>
    </div>
  );
}