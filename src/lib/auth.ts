import type { Session } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ADMIN_EMAILS } from "@/config/admins";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

function assignedRole(email: string | null | undefined) {
  return email && ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "customer";
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Invalid email or password");
        }

        await connectDB();
        const user = await User.findOne({ email });

        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: assignedRole(user.email),
        };
      },
    }),
  ],
  pages: { signIn: "/?login=true" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      await connectDB();
      const email = user.email.toLowerCase();
      const role = assignedRole(email);
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        await User.create({ name: user.name ?? email, email, role });
      } else if (existingUser.role !== role) {
        existingUser.role = role;
        await existingUser.save();
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.role = assignedRole(user.email);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role === "admin" ? "admin" : "customer";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}
