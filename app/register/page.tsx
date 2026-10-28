import type { Metadata } from "next";
import AuthFrame from "@/components/AuthFrame";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a private B B Homes account to manage your property journey.",
};

export default function RegisterPage() {
  return (
    <AuthFrame title="A more considered way to find your next home." description="Keep property enquiries, viewing requests, valuations and investment updates together.">
      <AuthForm mode="register" />
    </AuthFrame>
  );
}
