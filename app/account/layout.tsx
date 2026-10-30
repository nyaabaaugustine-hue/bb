import type { ReactNode } from "react";
import PortalHeader from "@/components/PortalHeader";
import PortalShell from "@/components/PortalShell";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalHeader />
      <main id="main"><PortalShell>{children}</PortalShell></main>
    </>
  );
}
