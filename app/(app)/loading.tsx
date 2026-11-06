export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-4 w-40 rounded bg-line" />
      <div className="mt-3 h-10 w-80 rounded bg-line" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-3xl bg-line/70" />
        ))}
      </div>
    </div>
  );
}
