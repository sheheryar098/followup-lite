import { parseTags } from "@/lib/followup";

export function TagList({ tags }: { tags: string }) {
  const list = parseTags(tags);
  if (list.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {list.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-line bg-cream px-2 py-0.5 text-[11px] text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
