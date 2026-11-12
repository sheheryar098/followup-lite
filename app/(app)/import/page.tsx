import Link from "next/link";
import { ImportForm } from "@/components/import-form";

export const metadata = { title: "Import & export" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rust">
        Your data
      </p>
      <h1 className="font-display text-4xl tracking-tight">Import & export</h1>
      <p className="mt-2 max-w-xl text-muted">
        Bring a spreadsheet, take a spreadsheet. Columns: name, company, email, url,
        channel, status, tags, notes, nextFollowUpAt, lastTouchedAt.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/api/export" className="btn btn-primary">
          Export CSV
        </a>
        <a href="/sample-contacts.csv" className="btn btn-secondary">
          Download sample CSV
        </a>
      </div>

      <h2 className="mt-10 font-display text-2xl">Import</h2>
      <p className="mt-1 text-sm text-muted">
        Preview the first rows, then import. Invalid rows are skipped and listed.
      </p>
      <div className="mt-4">
        <ImportForm />
      </div>
      <p className="mt-4 text-sm text-muted">
        Already have people in the app? Export first. Need a reset?{" "}
        <Link href="/settings" className="underline">
          Reload demo data
        </Link>
        .
      </p>
    </div>
  );
}
