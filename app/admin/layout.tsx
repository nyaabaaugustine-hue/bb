import type { ReactNode } from "react";
import PortalHeader from "@/components/PortalHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalHeader admin />
      <main id="main">{children}</main>
    </>
  );
}
