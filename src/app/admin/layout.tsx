import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#F5F7FA] min-h-[calc(100vh-100px)]">
      {/* Sidebar - fixed to left side */}
      <div className="hidden lg:block fixed left-0 top-[120px] bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto z-40">
        <AdminSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {children}
      </div>
    </div>
  );
}
