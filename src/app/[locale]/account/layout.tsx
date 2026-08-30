import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/i18n/routing";

export default async function AccountLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // Restrict admin users from accessing customer account pages
  if (session?.user?.role === "admin") {
    redirect({ href: "/admin", locale }); 
  }

  return <>{children}</>;
}
