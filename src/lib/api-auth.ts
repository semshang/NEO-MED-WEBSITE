import { getServerSession } from "next-auth";
import "server-only";
import { NextResponse } from "next/server";
import { authOptions, isAdmin } from "@/lib/auth";

export async function getApiSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getApiSession();
  if (!session?.user?.email) {
    return { session: null, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (!isAdmin(session)) {
    return { session: null, response: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}
