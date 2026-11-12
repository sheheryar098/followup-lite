"use client";

import { useRef, useState, useTransition } from "react";
import { Check, PenLine } from "lucide-react";
import { logTouch } from "@/lib/actions";
import {
  CHANNELS,
  CHANNEL_LABELS,
  FOLLOW_UP_PRESETS,
  toDateInputValue,
} from "@/lib/followup";
import type { ContactDTO } from "@/lib/dto";

export function LogTouchDialog({
  contact,
  compact = false,
}: {
  contact: ContactDTO;
  compact?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [preset, setPreset] = useState("3");

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" className={compact ? "btn btn-accent" : "btn btn-primary"} onClick={open}>
        <PenLine className="h-3.5 w-3.5" />
        Log touch
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(92vw,420px)] rounded-3xl border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/40"
        aria-label={`Log a touch with ${contact.name}`}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <form
          action={(formData) => {
            startTransition(async () => {
              await logTouch(formData);
              close();
            });
          }}
          className="p-5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rust">
            Log a touch
          </p>
          <h2 className="mt-1 font-display text-2xl">{contact.name}</h2>
          <p className="text-sm text-muted">{contact.company}</p>
          <input type="hidden" name="contactId" value={contact.id} />
          <div className="mt-5 grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Date</span>
              <input
                className="field"
                type="date"
                name="date"
                defaultValue={toDateInputValue(new Date())}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Channel</span>
              <select className="field" name="channel" defaultValue={contact.channel}>
                {CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {CHANNEL_LABELS[channel]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Note</span>
              <textarea
                className="field min-h-24"
                name="note"
                placeholder="What happened, and what's next?"
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm text-muted">Next follow-up</legend>
              <div className="flex flex-wrap gap-2">
                {FOLLOW_UP_PRESETS.map((item) => (
                  <label
                    key={item.id}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                      preset === String(item.days)
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-cream"
                    }`}
                  >
                    <input
                      type="radio"
                      name="followUpPreset"
                      value={item.days}
                      className="sr-only"
                      checked={preset === String(item.days)}
                      onChange={() => setPreset(String(item.days))}
                    />
                    {item.label}
                  </label>
                ))}
                <label
                  className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                    preset === "custom"
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-cream"
                  }`}
                >
                  <input
                    type="radio"
                    name="followUpPreset"
                    value="custom"
                    className="sr-only"
                    checked={preset === "custom"}
                    onChange={() => setPreset("custom")}
                  />
                  Custom
                </label>
              </div>
              {preset === "custom" ? (
                <input
                  className="field mt-3"
                  type="date"
                  name="nextFollowUpAt"
                  defaultValue={toDateInputValue(new Date())}
                />
              ) : null}
            </fieldset>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={pending}>
              <Check className="h-3.5 w-3.5" />
              {pending ? "Saving…" : "Save touch"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
