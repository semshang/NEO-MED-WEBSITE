import { AdminSidebar } from "@/components/AdminSidebar";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/?login=true&callbackUrl=%2Fadmin");
  if (session.user.role !== "admin") redirect("/?error=unauthorized");

  return (
    <div className="flex bg-[#F5F7FA] min-h-[calc(100vh-73px)]">
      {/* Sidebar - fixed to left side */}
      <div 
        className="hidden lg:flex flex-col fixed left-0 bottom-0 w-64 bg-white border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.03)] z-40 overflow-y-auto"
        style={{ top: '73px' }}
      >
        <AdminSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {children}
      </div>
    </div>
  );
}
