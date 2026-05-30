export default function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#141414] animate-pulse">
      <div style={{ aspectRatio: "2/3", backgroundColor: "#1F1F1F" }} />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-[#2A2A2A] rounded-full w-4/5" />
        <div className="h-3 bg-[#2A2A2A] rounded-full w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 6 }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
