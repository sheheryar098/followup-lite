import Link from "next/link";
import { notFound } from "next/navigation";
import { ChannelIcon } from "@/components/channel-icon";
import { LogTouchDialog } from "@/components/log-touch-dialog";
import { SnoozeMenu } from "@/components/snooze-menu";
import { StatusBadge } from "@/components/status-badge";
import { TagList } from "@/components/tag-list";
import { DeleteContactButton } from "@/components/delete-contact-button";
import { getContact, toContactDTO } from "@/lib/queries";
import {
  FOLLOW_UP_PRESETS,
  formatLongDate,
  formatRelativeDay,
  formatShortDate,
} from "@/lib/followup";
import { setFollowUpDate } from "@/lib/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  return { title: contact?.name ?? "Contact" };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();
  const dto = toContactDTO(contact);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/contacts" className="text-sm text-muted hover:text-ink">
        ← Contacts
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">{contact.name}</h1>
          <p className="mt-1 text-muted">{contact.company ?? "Independent"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={contact.status} />
            <ChannelIcon channel={contact.channel} withLabel />
            <TagList tags={contact.tags} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/contacts/${contact.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <SnoozeMenu contactId={contact.id} />
          <LogTouchDialog contact={dto} />
        </div>
      </div>

      <section className="paper-card mt-8 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rust">
          Next follow-up
        </p>
        <p className="mt-2 font-display text-3xl">
          {contact.nextFollowUpAt
            ? `${formatShortDate(contact.nextFollowUpAt)} · ${formatRelativeDay(contact.nextFollowUpAt)}`
            : "Not scheduled"}
        </p>
        {contact.lastTouchedAt ? (
          <p className="mt-1 text-sm text-muted">
            Last touched {formatRelativeDay(contact.lastTouchedAt).toLowerCase()}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">No touches yet</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {FOLLOW_UP_PRESETS.map((preset) => (
            <form
              key={preset.id}
              action={async () => {
                "use server";
                await setFollowUpDate(contact.id, preset.days);
              }}
            >
              <button type="submit" className="btn btn-secondary">
                {preset.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-3 text-sm md:grid-cols-2">
        <Info label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : null} />
        <Info label="URL" value={contact.url} href={contact.url} />
      </section>

      {contact.notes ? (
        <section className="paper-card mt-6 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Notes
          </p>
          <p className="mt-2 whitespace-pre-wrap leading-7">{contact.notes}</p>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl">Touch log</h2>
        {contact.touches.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing logged yet. The first note is the hardest.</p>
        ) : (
          <ol className="mt-5 space-y-4">
            {contact.touches.map((touch) => (
              <li key={touch.id} className="flex gap-4">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rust" />
                <div>
                  <p className="text-sm font-medium">
                    {formatLongDate(touch.date)} ·{" "}
                    <ChannelIcon channel={touch.channel} withLabel className="inline-flex" />
                  </p>
                  {touch.note ? (
                    <p className="mt-1 leading-6 text-ink/80">{touch.note}</p>
                  ) : (
                    <p className="mt-1 text-sm text-muted">No note</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-12">
        <DeleteContactButton id={contact.id} />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null;
  href: string | null;
}) {
  return (
    <div className="paper-card p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
      {value ? (
        href ? (
          <a href={href} className="mt-1 block truncate hover:underline">
            {value}
          </a>
        ) : (
          <p className="mt-1">{value}</p>
        )
      ) : (
        <p className="mt-1 text-muted">—</p>
      )}
    </div>
  );
}
