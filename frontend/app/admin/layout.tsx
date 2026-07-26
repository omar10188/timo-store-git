import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | Timo Store",
  description: "Secure Admin Control Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}
    >
      <AdminSidebar />
      <main
        className="flex-1 p-8 overflow-y-auto"
        style={{ background: 'var(--color-bg)' }}
      >
        {children}
      </main>
    </div>
  );
}
