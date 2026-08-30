import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";

export async function getApiSession() {
  return getServerSession(authOptions);
}

export async function getAdminSession() {
  const session = await getApiSession();
  return isAdmin(session) ? session : null;
}
