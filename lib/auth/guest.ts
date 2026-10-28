import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { safeNextPath } from "@/lib/auth/next-path";

/**
 * For /login and /register: if the visitor already has a valid session, send
 * them onward instead of showing the form. If the auth service is unreachable
 * we fall through and show the form rather than breaking the page.
 */
export async function redirectIfSignedIn(next: string | string[] | undefined) {
  let signedIn = false;
  try {
    const { data } = await auth.getSession();
    signedIn = Boolean(data?.user);
  } catch {
    signedIn = false;
  }
  if (signedIn) redirect(safeNextPath(Array.isArray(next) ? next[0] : next));
}
