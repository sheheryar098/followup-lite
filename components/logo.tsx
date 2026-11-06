import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rust text-paper shadow-[0_1px_0_rgb(28_22_18/0.12)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor" />
          <path
            d="M8 9h8M8 12.5h8M8 16h5"
            stroke="#C24A1A"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className={cn(compact && "sr-only")}>
        <span className="block font-display text-lg leading-none tracking-tight">
          FollowUp
        </span>
        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.22em] text-rust">
          Lite
        </span>
      </span>
    </Link>
  );
}
