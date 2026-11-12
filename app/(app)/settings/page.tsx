import { BrowserPermission } from "@/components/browser-permission";
import { DemoButton } from "@/components/demo-button";
import { DigestButton } from "@/components/digest-button";
import { saveSettings } from "@/lib/actions";
import { getSettings } from "@/lib/queries";
import { selectProvider } from "@/lib/reminders";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  const provider = selectProvider({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DIGEST_TO: process.env.DIGEST_TO || settings.digestEmail || "",
  });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rust">
        Reminders
      </p>
      <h1 className="font-display text-4xl tracking-tight">Settings</h1>
      <p className="mt-2 text-muted">
        Email when you want it. In-app and browser nudges when you don&apos;t. The app
        never requires a paid API.
      </p>

      <section className="paper-card mt-8 p-6">
        <h2 className="font-display text-2xl">Daily digest</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Current provider: <span className="text-ink">{provider}</span>
          {settings.lastDigestAt
            ? ` · last run ${settings.lastDigestAt.toLocaleString()}`
            : " · not run yet"}
          . Set <code className="rounded bg-cream px-1">RESEND_API_KEY</code> and{" "}
          <code className="rounded bg-cream px-1">DIGEST_TO</code> to send email via
          Resend. Otherwise a digest is stored in the bell menu.
        </p>
        <form action={saveSettings} className="mt-5 grid gap-4">
          <label className="grid gap-1 text-sm">
            <span>Digest email</span>
            <input
              className="field"
              type="email"
              name="digestEmail"
              defaultValue={settings.digestEmail ?? ""}
              placeholder="you@studio.example"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="browserNotifications"
              defaultChecked={settings.browserNotifications}
            />
            Allow a once-a-day browser notification when follow-ups are due
          </label>
          <div>
            <button type="submit" className="btn btn-primary">
              Save settings
            </button>
          </div>
        </form>
        <div className="mt-6 border-t border-line pt-5">
          <DigestButton />
        </div>
        <div className="mt-4">
          <BrowserPermission />
        </div>
      </section>

      <section className="paper-card mt-6 p-6">
        <h2 className="font-display text-2xl">Demo data</h2>
        <p className="mt-2 text-sm text-muted">
          Replace the database with a realistic freelance outreach pipeline — overdue,
          due today, upcoming, won, and lost.
        </p>
        <div className="mt-4">
          <DemoButton />
        </div>
      </section>
    </div>
  );
}
