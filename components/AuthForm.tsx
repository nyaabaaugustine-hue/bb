"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { safeNextPath } from "@/lib/auth/next-path";

function authErrorMessage(error: unknown, isRegister: boolean) {
  const { code, status } = (error ?? {}) as { code?: string; status?: number };
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (!isRegister && code === "EMAIL_NOT_VERIFIED") {
    return "Please verify your email address first. Check your inbox for the verification link, then sign in.";
  }
  return isRegister
    ? "We couldn't create your account. Check your details and try again."
    : "We couldn't sign you in. Check your details and try again.";
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const destination = safeNextPath(new URLSearchParams(window.location.search).get("next"));

    try {
      const result = isRegister
        ? await authClient.signUp.email({
            name: String(form.get("name") ?? "").trim(),
            email,
            password,
          })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(authErrorMessage(result.error, isRegister));
        return;
      }

      if (isRegister) {
        const session = await authClient.getSession();
        if (!session.error && session.data?.user) {
          router.replace(destination);
          router.refresh();
          return;
        }
        setNotice("Your account was created. Check your email if verification is required, then sign in.");
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch {
      setError("We couldn't complete that request. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">{isRegister ? "Create your account" : "Welcome back"}</p>
      <h2 className="mt-2 text-3xl leading-tight text-ink">{isRegister ? "Start with a clear next step." : "Continue your home journey."}</h2>
      <p className="mt-2 text-sm leading-6 text-mute">
        {isRegister
          ? "Save your enquiries and keep track of viewings, valuations and investment updates."
          : "Your enquiries, bookings and property updates are ready when you are."}
      </p>

      <form className="mt-7 space-y-4" onSubmit={submit}>
        {isRegister && (
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" autoComplete="name" required maxLength={100} className="field min-h-12" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className="field min-h-12" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 12 : undefined}
              maxLength={128}
              className="field min-h-12 pr-16"
            />
            <button type="button" className="absolute inset-y-0 right-3 my-auto h-9 px-1 text-xs font-semibold text-mute underline-offset-2 hover:text-ink hover:underline" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {isRegister && <p className="mt-1.5 text-xs text-mute">Use at least 12 characters.</p>}
        </div>

        {error && <p role="alert" className="rounded-lg border border-red-800/20 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-900">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-moss/20 bg-moss/5 px-3 py-2.5 text-sm font-medium text-moss">{notice}</p>}

        <button type="submit" disabled={pending} className="btn-primary min-h-12 w-full justify-center !rounded-lg !text-base disabled:cursor-wait">
          {pending ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mute">
        {isRegister ? "Already have an account?" : "New to B B Homes?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="font-bold text-terra underline-offset-4 hover:underline">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
      {!isRegister && process.env.NODE_ENV === "development" && (
        <p className="mt-4 text-center text-sm text-mute">
          Want to try the flow without a real account?{" "}
          <Link href="/local-demo" className="font-semibold text-terra underline-offset-4 hover:underline">
            Open local simulator
          </Link>
        </p>
      )}
      <p className="mt-5 text-center text-xs leading-5 text-mute">
        Your account is protected by B B Homes. Property and payment requests are reviewed by our team before they are confirmed.
      </p>
    </div>
  );
}
