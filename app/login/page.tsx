import { Logo } from "@/components/logo";
import { login } from "@/lib/actions";
import { isAuthEnabled } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isAuthEnabled()) redirect("/");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md paper-card p-8">
        <Logo />
        <h1 className="mt-6 font-display text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Optional password gate. Leave AUTH_PASSWORD unset and the demo stays open.
        </p>
        <form action={login} className="mt-6 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span>Password</span>
            <input className="field" type="password" name="password" required autoFocus />
          </label>
          {error ? <p className="text-sm text-rose">That password didn&apos;t match.</p> : null}
          <button type="submit" className="btn btn-primary">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
