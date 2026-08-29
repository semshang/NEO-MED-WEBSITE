import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#F5F7FA] min-h-[calc(100vh-100px)]">
      {/* Sidebar - fixed position relative to viewport but scrolls inside */}
      <div className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200">
        <div className="sticky top-[100px] h-[calc(100vh-100px)] overflow-y-auto">
          <AdminSidebar />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
