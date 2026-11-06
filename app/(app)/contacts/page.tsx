import Link from "next/link";
import { ContactFilters } from "@/components/filters";
import { ChannelIcon } from "@/components/channel-icon";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, AddContactLink } from "@/components/empty-state";
import { getAllTags, getContacts } from "@/lib/queries";
import {
  formatRelativeDay,
  formatShortDate,
  type Channel,
  type Status,
} from "@/lib/followup";

export const metadata = { title: "Contacts" };

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; channel?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const status = (params.status ?? "") as Status | "";
  const channel = (params.channel ?? "") as Channel | "";
  const tag = params.tag ?? "";
  const [contacts, tags] = await Promise.all([
    getContacts({ q, status, channel, tag }),
    getAllTags(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rust">
            Notebook
          </p>
          <h1 className="font-display text-4xl tracking-tight">Contacts</h1>
          <p className="mt-2 text-muted">
            {contacts.length} {contacts.length === 1 ? "person" : "people"}
            {q || status || channel || tag ? " matching filters" : " in the book"}.
          </p>
        </div>
        <AddContactLink />
      </div>

      <div className="mt-6">
        <ContactFilters q={q} status={status} channel={channel} tag={tag} tags={tags} />
      </div>

      {contacts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No matches"
            body="Clear a filter or add someone new. FollowUp Lite stays useful at 12 contacts, not 12,000."
            action={<AddContactLink />}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-paper">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-cream/80 text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last touch</th>
                <th className="px-4 py-3 font-medium">Next follow-up</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-t border-line hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                      {contact.name}
                    </Link>
                    <div className="text-xs text-muted">{contact.company ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <ChannelIcon channel={contact.channel} withLabel />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {contact.lastTouchedAt
                      ? formatRelativeDay(contact.lastTouchedAt)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {contact.nextFollowUpAt ? (
                      <span>
                        {formatShortDate(contact.nextFollowUpAt)}{" "}
                        <span className="text-muted">
                          · {formatRelativeDay(contact.nextFollowUpAt)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
