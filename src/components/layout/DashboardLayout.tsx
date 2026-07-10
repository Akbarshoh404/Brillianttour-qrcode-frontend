import type { ReactNode } from "react";

export function DashboardLayout({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {header}
      <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
    </div>
  );
}
