import { getAdminSessionAction } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSessionAction();

  // If no session (e.g. on /admin/login), render children without admin sidebar
  if (!session) {
    return <div className="min-h-screen bg-[#0d0d0d]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 flex flex-row-reverse selection:bg-white selection:text-black">
      {/* Admin Sidebar (Right in RTL) */}
      <AdminSidebar user={session} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader user={session} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
