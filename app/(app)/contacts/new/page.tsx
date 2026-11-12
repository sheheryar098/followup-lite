import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { createContact } from "@/lib/actions";

export const metadata = { title: "New contact" };

export default function NewContactPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/contacts" className="text-sm text-muted hover:text-ink">
        ← Contacts
      </Link>
      <h1 className="mt-3 font-display text-4xl tracking-tight">New contact</h1>
      <p className="mt-2 text-muted">
        Name, channel, and a next date. Everything else is optional on purpose.
      </p>
      <div className="mt-6">
        <ContactForm action={createContact} submitLabel="Save contact" />
      </div>
    </div>
  );
}
