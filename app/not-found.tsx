import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rust">404</p>
      <h1 className="mt-2 font-display text-4xl">That page wandered off.</h1>
      <p className="mt-2 text-muted">Go back to the queue and pick up the next follow-up.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Due today
      </Link>
    </div>
  );
}
