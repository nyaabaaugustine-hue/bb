const ENDPOINT = process.env.FORMSPREE_ENDPOINT ?? "https://formspree.io/f/xwllnqla";

/**
 * Mirrors a website submission to the B B Homes Formspree inbox.
 * Never throws and never fails the caller: the database record stays the source of truth,
 * and the team still sees the submission in the dashboard if Formspree is unreachable.
 */
export async function forwardToFormspree(fields: Record<string, string | null | undefined>) {
  const payload = Object.fromEntries(Object.entries(fields).filter(([, value]) => value));
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) console.warn(`Formspree rejected a submission (${response.status}).`);
  } catch (error) {
    console.warn("Formspree submission could not be delivered.", error);
  }
}
