import type { ReactNode } from "react";
import PortalShell from "@/components/PortalShell";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
