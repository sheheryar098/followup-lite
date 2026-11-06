import {
  CHANNELS,
  CHANNEL_LABELS,
  STATUSES,
  STATUS_LABELS,
  toDateInputValue,
  type Channel,
  type Status,
} from "@/lib/followup";

type Values = {
  id?: string;
  name?: string;
  company?: string | null;
  email?: string | null;
  url?: string | null;
  channel?: Channel;
  status?: Status;
  tags?: string;
  notes?: string;
  nextFollowUpAt?: Date | string | null;
};

export function ContactForm({
  action,
  values,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  values?: Values;
  submitLabel: string;
}) {
  const next =
    values?.nextFollowUpAt instanceof Date
      ? toDateInputValue(values.nextFollowUpAt)
      : values?.nextFollowUpAt
        ? toDateInputValue(new Date(values.nextFollowUpAt))
        : "";

  return (
    <form action={action} className="paper-card grid gap-4 p-6">
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm sm:col-span-1">
          <span>Name</span>
          <input className="field" name="name" required defaultValue={values?.name} />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Company</span>
          <input className="field" name="company" defaultValue={values?.company ?? ""} />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input
            className="field"
            type="email"
            name="email"
            defaultValue={values?.email ?? ""}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>URL</span>
          <input
            className="field"
            type="url"
            name="url"
            placeholder="https://…"
            defaultValue={values?.url ?? ""}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Channel</span>
          <select className="field" name="channel" defaultValue={values?.channel ?? "EMAIL"}>
            {CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {CHANNEL_LABELS[channel]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Status</span>
          <select className="field" name="status" defaultValue={values?.status ?? "NEW"}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Tags</span>
          <input
            className="field"
            name="tags"
            placeholder="warm, saas, referral"
            defaultValue={values?.tags ?? ""}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Next follow-up</span>
          <input className="field" type="date" name="nextFollowUpAt" defaultValue={next} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span>Notes</span>
        <textarea
          className="field min-h-32"
          name="notes"
          defaultValue={values?.notes ?? ""}
          placeholder="Context you don't want to lose — intro source, budget, the actual human."
        />
      </label>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
