export const SESSION_COOKIE = "followup_session";

export function isAuthEnabled(): boolean {
  return Boolean(process.env.AUTH_PASSWORD?.trim());
}

export async function sessionToken(): Promise<string> {
  const password = process.env.AUTH_PASSWORD ?? "";
  const secret = process.env.AUTH_SECRET || password;
  const data = new TextEncoder().encode(`${secret}:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function verifyPassword(password: string): boolean {
  return isAuthEnabled() && password === process.env.AUTH_PASSWORD;
}
