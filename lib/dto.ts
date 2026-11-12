import type { Channel, Status } from "./followup";

export type TouchDTO = {
  id: string;
  date: string;
  channel: Channel;
  note: string;
};

export type ContactDTO = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  url: string | null;
  channel: Channel;
  status: Status;
  tags: string;
  notes: string;
  nextFollowUpAt: string | null;
  lastTouchedAt: string | null;
  lastTouch: TouchDTO | null;
};

export function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}
