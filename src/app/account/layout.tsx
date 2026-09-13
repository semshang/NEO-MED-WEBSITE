import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Review your Neomeditech requests, messages, and account information.",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/?login=true&callbackUrl=%2Faccount");
  }

  // Restrict admin users from accessing customer account pages
  if (session?.user?.role === "admin") {
    redirect("/admin"); 
  }

  return <>{children}</>;
}
