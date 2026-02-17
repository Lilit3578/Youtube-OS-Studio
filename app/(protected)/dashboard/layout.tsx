import { ReactNode } from "react";

// Auth is already enforced by the parent (protected) layout.
// This layout exists for potential dashboard-specific UI (sidebar, nav, etc.).
export default function LayoutDashboard({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
