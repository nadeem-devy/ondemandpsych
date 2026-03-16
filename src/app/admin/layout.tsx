import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard | OnDemandPsych",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#070e24]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-6">{children}</main>
    </div>
  );
}
