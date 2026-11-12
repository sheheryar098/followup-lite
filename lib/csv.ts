import {
  CHANNEL_LABELS,
  parseChannel,
  parseDateInput,
  parseStatus,
  parseTags,
  serializeTags,
  toDateInputValue,
  type Channel,
  type Status,
} from "./followup";

export const CSV_HEADERS = [
  "name",
  "company",
  "email",
  "url",
  "channel",
  "status",
  "tags",
  "notes",
  "nextFollowUpAt",
  "lastTouchedAt",
] as const;

export type CsvContact = {
  name: string;
  company: string;
  email: string;
  url: string;
  channel: Channel;
  status: Status;
  tags: string;
  notes: string;
  nextFollowUpAt: Date | null;
  lastTouchedAt: Date | null;
};

export type CsvRowError = {
  row: number;
  message: string;
};

export type CsvParseResult = {
  contacts: CsvContact[];
  errors: CsvRowError[];
};

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

export function serializeCsv(rows: Array<Array<string | number | null | undefined>>): string {
  return rows
    .map((row) => row.map((value) => escapeCsvCell(value ?? "")).join(","))
    .join("\n");
}

export function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function headerIndex(headers: string[], name: string): number {
  return headers.findIndex((header) => header.trim().toLowerCase() === name.toLowerCase());
}

function cell(row: string[], index: number): string {
  if (index < 0) return "";
  return (row[index] ?? "").trim();
}

export function contactsFromCsv(text: string): CsvParseResult {
  const table = parseCsv(text);
  if (table.length === 0) {
    return { contacts: [], errors: [{ row: 0, message: "CSV is empty" }] };
  }

  const headers = table[0].map((header) => header.trim());
  const nameIdx = headerIndex(headers, "name");
  if (nameIdx < 0) {
    return {
      contacts: [],
      errors: [{ row: 1, message: "Missing required 'name' column" }],
    };
  }

  const indexes = {
    name: nameIdx,
    company: headerIndex(headers, "company"),
    email: headerIndex(headers, "email"),
    url: headerIndex(headers, "url"),
    channel: headerIndex(headers, "channel"),
    status: headerIndex(headers, "status"),
    tags: headerIndex(headers, "tags"),
    notes: headerIndex(headers, "notes"),
    nextFollowUpAt: headerIndex(headers, "nextFollowUpAt"),
    lastTouchedAt: headerIndex(headers, "lastTouchedAt"),
  };

  const contacts: CsvContact[] = [];
  const errors: CsvRowError[] = [];

  table.slice(1).forEach((row, offset) => {
    const rowNumber = offset + 2;
    const name = cell(row, indexes.name);
    if (!name) {
      errors.push({ row: rowNumber, message: "Name is required" });
      return;
    }

    const channelValue = cell(row, indexes.channel);
    const channel = channelValue ? parseChannel(channelValue) : "EMAIL";
    if (channelValue && !channel) {
      errors.push({
        row: rowNumber,
        message: `Unknown channel "${channelValue}"`,
      });
      return;
    }

    const statusValue = cell(row, indexes.status);
    const status = statusValue ? parseStatus(statusValue) : "NEW";
    if (statusValue && !status) {
      errors.push({
        row: rowNumber,
        message: `Unknown status "${statusValue}"`,
      });
      return;
    }

    const nextRaw = cell(row, indexes.nextFollowUpAt);
    const lastRaw = cell(row, indexes.lastTouchedAt);
    const nextFollowUpAt = nextRaw ? parseFlexibleDate(nextRaw) : null;
    const lastTouchedAt = lastRaw ? parseFlexibleDate(lastRaw) : null;

    if (nextRaw && !nextFollowUpAt) {
      errors.push({ row: rowNumber, message: `Invalid nextFollowUpAt "${nextRaw}"` });
      return;
    }
    if (lastRaw && !lastTouchedAt) {
      errors.push({ row: rowNumber, message: `Invalid lastTouchedAt "${lastRaw}"` });
      return;
    }

    contacts.push({
      name,
      company: cell(row, indexes.company),
      email: cell(row, indexes.email),
      url: cell(row, indexes.url),
      channel: channel ?? "EMAIL",
      status: status ?? "NEW",
      tags: serializeTags(parseTags(cell(row, indexes.tags))),
      notes: cell(row, indexes.notes),
      nextFollowUpAt,
      lastTouchedAt,
    });
  });

  return { contacts, errors };
}

function parseFlexibleDate(value: string): Date | null {
  const fromInput = parseDateInput(value);
  if (fromInput) return fromInput;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function contactsToCsv(
  contacts: Array<{
    name: string;
    company: string | null;
    email: string | null;
    url: string | null;
    channel: Channel;
    status: Status;
    tags: string;
    notes: string;
    nextFollowUpAt: Date | null;
    lastTouchedAt: Date | null;
  }>,
): string {
  const rows: Array<Array<string>> = [
    [...CSV_HEADERS],
    ...contacts.map((contact) => [
      contact.name,
      contact.company ?? "",
      contact.email ?? "",
      contact.url ?? "",
      CHANNEL_LABELS[contact.channel],
      contact.status,
      contact.tags,
      contact.notes,
      contact.nextFollowUpAt ? toDateInputValue(contact.nextFollowUpAt) : "",
      contact.lastTouchedAt ? toDateInputValue(contact.lastTouchedAt) : "",
    ]),
  ];
  return serializeCsv(rows);
}
