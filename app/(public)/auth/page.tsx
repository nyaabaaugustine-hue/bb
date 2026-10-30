import type { Metadata } from "next";
import Link from "next/link";
import AuthFrame from "@/components/AuthFrame";

export const metadata: Metadata = {
  title: "Your account",
  description: "Sign in or create a B B Homes account to manage your property journey.",
};

export default function AuthPage() {
  return (
    <AuthFrame title="A more considered way to find your next home." description="Keep property enquiries, viewing requests, valuations and investment updates together.">
      <p className="eyebrow">B B Homes account</p>
      <h2 className="mt-2 text-3xl leading-tight text-ink">How would you like to continue?</h2>
      <p className="mt-3 text-sm leading-6 text-mute">Your account is private to you. Our team confirms appointments and reviews property submissions before anything is marked as approved.</p>
      <div className="mt-8 grid gap-3">
        <Link href="/login" className="btn-primary min-h-12 justify-center !rounded-lg !text-base">Sign in</Link>
        <Link href="/register" className="btn min-h-12 justify-center !rounded-lg !text-base">Create an account</Link>
      </div>
      <p className="mt-7 text-center text-sm text-mute">
        Need help? <Link href="/contact" className="font-semibold text-terra underline-offset-4 hover:underline">Talk to the team</Link>
      </p>
    </AuthFrame>
  );
}
