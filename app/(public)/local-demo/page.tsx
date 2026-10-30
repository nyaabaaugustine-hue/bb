import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LocalDemo from "@/components/LocalDemo";

export const metadata: Metadata = {
  title: "Local account simulator",
  robots: { index: false, follow: false },
};

export default function LocalDemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LocalDemo />;
}