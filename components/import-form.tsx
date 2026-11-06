"use client";

import { useState, useTransition } from "react";
import { importContacts } from "@/lib/actions";
import { contactsFromCsv } from "@/lib/csv";

type Preview = {
  name: string;
  company: string;
  channel: string;
  status: string;
};

export function ImportForm() {
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<Preview[]>([]);
  const [result, setResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);

  return (
    <form
      className="paper-card p-6"
      action={(formData) => {
        startTransition(async () => {
          const next = await importContacts(formData);
          setResult(next);
        });
      }}
    >
      <label className="grid gap-2 text-sm">
        <span className="text-muted">CSV file</span>
        <input
          className="field"
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) {
              setPreview([]);
              return;
            }
            const parsed = contactsFromCsv(await file.text());
            setPreview(
              parsed.contacts.slice(0, 6).map((contact) => ({
                name: contact.name,
                company: contact.company,
                channel: contact.channel,
                status: contact.status,
              })),
            );
          }}
        />
      </label>
      {preview.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Channel</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row) => (
                <tr key={row.name} className="border-t border-line">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.company}</td>
                  <td className="px-3 py-2">{row.channel}</td>
                  <td className="px-3 py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-5 flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Importing…" : "Import contacts"}
        </button>
        {result ? (
          <p className="text-sm text-muted">
            Imported {result.created}
            {result.errors.length > 0 ? ` · ${result.errors.length} row errors` : ""}
          </p>
        ) : null}
      </div>
      {result?.errors.length ? (
        <ul className="mt-4 space-y-1 text-sm text-rose">
          {result.errors.slice(0, 8).map((error) => (
            <li key={`${error.row}-${error.message}`}>
              Row {error.row}: {error.message}
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
