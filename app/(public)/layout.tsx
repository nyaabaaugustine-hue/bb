import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import PublicFooter from "@/components/PublicFooter";
import PublicFloatingActions from "@/components/PublicFloatingActions";
import PublicOverlays from "@/components/PublicOverlays";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main">{children}</main>
      <PublicFloatingActions />
      <PublicOverlays />
      <PublicFooter />
    </>
  );
}
