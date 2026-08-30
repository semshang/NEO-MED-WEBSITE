import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

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
