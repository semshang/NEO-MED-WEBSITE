code = """
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ADMIN_EMAILS } from "@/config/admins";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }
        
        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }
        
        const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isMatch) {
          throw new Error("Invalid email or password");
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: '/?login=true',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email?.toLowerCase() });
        const assignedRole = ADMIN_EMAILS.includes(user.email || "") ? "admin" : "customer";
        
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email?.toLowerCase(),
            role: assignedRole
          });
        } else if (existingUser.role !== assignedRole) {
          existingUser.role = assignedRole;
          await existingUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = ADMIN_EMAILS.includes(user.email || "") ? "admin" : "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
"""

with open("src/app/api/auth/[...nextauth]/route.ts", "w", encoding="utf-8") as f:
    f.write(code.strip())
