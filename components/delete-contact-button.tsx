"use client";

import { deleteContact } from "@/lib/actions";

export function DeleteContactButton({ id }: { id: string }) {
  return (
    <form
      action={deleteContact}
      onSubmit={(event) => {
        if (!confirm("Delete this contact and their touch log?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn btn-danger">
        Delete contact
      </button>
    </form>
  );
}
