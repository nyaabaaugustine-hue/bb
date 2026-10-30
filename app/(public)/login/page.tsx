import type { Metadata } from "next";
import AuthFrame from "@/components/AuthFrame";
import AuthForm from "@/components/AuthForm";
import { redirect } from "next/navigation";
import { redirectIfSignedIn } from "@/lib/auth/guest";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your private B B Homes account.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  if (process.env.NODE_ENV === "development") redirect("/local-demo");
  const { next } = await searchParams;
  await redirectIfSignedIn(next);
  return (
    <AuthFrame title="A more considered way to find your next home." description="Keep property enquiries, viewing requests, valuations and investment updates together.">
      <AuthForm mode="login" />
    </AuthFrame>
  );
}
