import Link from "next/link";
import { DueCard } from "@/components/due-card";
import { DemoButton } from "@/components/demo-button";
import { EmptyState, AddContactLink } from "@/components/empty-state";
import { getContacts, getQueue, getStatusCounts, toContactDTO } from "@/lib/queries";
import { formatLongDate } from "@/lib/followup";

export const metadata = { title: "Due today" };

export default async function DashboardPage() {
  const [queue, counts, all] = await Promise.all([
    getQueue(),
    getStatusCounts(),
    getContacts(),
  ]);
  const due = queue.overdue.length + queue.dueToday.length;
  const open = all.filter((contact) =>
    ["NEW", "CONTACTED", "REPLIED"].includes(contact.status),
  ).length;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rust">
        {formatLongDate(new Date())}
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            {due === 0 ? "Nobody is waiting." : `${due} waiting on you.`}
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Overdue first, then today, then what&apos;s coming. Log a touch or snooze it.
            That&apos;s the whole CRM.
          </p>
        </div>
        {all.length === 0 ? <DemoButton label="Load demo pipeline" /> : null}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Overdue" value={queue.overdue.length} tone="rust" />
        <Stat label="Due today" value={queue.dueToday.length} tone="gold" />
        <Stat label="Upcoming" value={queue.upcoming.length} tone="sage" />
        <Stat label="Open pipeline" value={open} tone="ink" />
      </dl>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span>New {counts.NEW ?? 0}</span>
        <span>· Contacted {counts.CONTACTED ?? 0}</span>
        <span>· Replied {counts.REPLIED ?? 0}</span>
        <span>· Won {counts.WON ?? 0}</span>
        <span>· Lost {counts.LOST ?? 0}</span>
      </div>

      {all.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your notebook is empty"
            body="Add the people you're actually chasing, or load the demo pipeline to see FollowUp Lite with a realistic freelance book of outreach."
            action={
              <div className="flex gap-2">
                <AddContactLink />
                <DemoButton />
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          <QueueSection
            eyebrow="Overdue"
            title="These slipped."
            empty="Nothing overdue. Rare and beautiful."
            contacts={queue.overdue.map(toContactDTO)}
          />
          <QueueSection
            eyebrow="Due today"
            title="Do these before you close the laptop."
            empty="Inbox zero, follow-up edition."
            contacts={queue.dueToday.map(toContactDTO)}
          />
          <QueueSection
            eyebrow="Upcoming"
            title="On the calendar."
            empty="No future nudges scheduled."
            contacts={queue.upcoming.map(toContactDTO)}
          />
          {queue.unscheduled.length > 0 ? (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Unscheduled
              </p>
              <p className="mt-1 text-sm text-muted">
                Open contacts with no next date. Give them one so they don&apos;t vanish.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {queue.unscheduled.map((contact) => (
                  <li key={contact.id}>
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="rounded-full border border-line bg-paper px-3 py-1 text-sm"
                    >
                      {contact.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "rust" | "gold" | "sage" | "ink";
}) {
  const tones = {
    rust: "text-rust",
    gold: "text-gold",
    sage: "text-sage",
    ink: "text-ink",
  };
  return (
    <div className="paper-card p-4">
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className={`mt-1 font-display text-3xl ${tones[tone]}`}>{value}</dd>
    </div>
  );
}

function QueueSection({
  eyebrow,
  title,
  empty,
  contacts,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  contacts: ReturnType<typeof toContactDTO>[];
}) {
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rust">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-display text-2xl">{title}</h2>
      {contacts.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {contacts.map((contact) => (
            <DueCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </section>
  );
}
