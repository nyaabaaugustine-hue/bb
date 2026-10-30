import type { Metadata } from "next";
import AuthFrame from "@/components/AuthFrame";
import AuthForm from "@/components/AuthForm";
import { redirectIfSignedIn } from "@/lib/auth/guest";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a private B B Homes account to manage your property journey.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  await redirectIfSignedIn(next);
  return (
    <AuthFrame title="A more considered way to find your next home." description="Keep property enquiries, viewing requests, valuations and investment updates together.">
      <AuthForm mode="register" />
    </AuthFrame>
  );
}
