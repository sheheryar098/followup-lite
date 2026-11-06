import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact-form";
import { updateContact } from "@/lib/actions";
import { getContact } from "@/lib/queries";

export const metadata = { title: "Edit contact" };

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/contacts/${contact.id}`} className="text-sm text-muted hover:text-ink">
        ← {contact.name}
      </Link>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Edit contact</h1>
      <div className="mt-6">
        <ContactForm action={updateContact} values={contact} submitLabel="Save changes" />
      </div>
    </div>
  );
}
