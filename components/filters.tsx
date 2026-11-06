import {
  CHANNELS,
  CHANNEL_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/followup";

export function ContactFilters({
  q,
  status,
  channel,
  tag,
  tags,
}: {
  q: string;
  status: string;
  channel: string;
  tag: string;
  tags: string[];
}) {
  return (
    <form className="paper-card grid gap-3 p-4 md:grid-cols-[1fr_10rem_10rem_10rem_auto]" method="get">
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Search</span>
        <input
          className="field"
          name="q"
          defaultValue={q}
          placeholder="Name, company, notes…"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Status</span>
        <select className="field" name="status" defaultValue={status}>
          <option value="">All</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {STATUS_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Channel</span>
        <select className="field" name="channel" defaultValue={channel}>
          <option value="">All</option>
          {CHANNELS.map((item) => (
            <option key={item} value={item}>
              {CHANNEL_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Tag</span>
        <select className="field" name="tag" defaultValue={tag}>
          <option value="">All</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button type="submit" className="btn btn-primary w-full md:w-auto">
          Filter
        </button>
      </div>
    </form>
  );
}
