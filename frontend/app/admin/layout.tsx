"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { useAdminSocket } from "@/lib/useAdminSocket";
import { Toaster } from "react-hot-toast";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  // Connect to Socket.io admin room for real-time notifications
  useAdminSocket();

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <AdminSidebar />
      <main
        className="flex-1 p-8 pt-12 md:pt-16 overflow-y-auto"
        style={{ background: "var(--color-bg)" }}
      >
        {children}
      </main>

      {/* Toast container for real-time notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-bg-elevated, #1a1a1a)",
            color: "var(--color-text-primary, #fff)",
            border: "1px solid var(--color-border, #2a2a2a)",
          },
        }}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
