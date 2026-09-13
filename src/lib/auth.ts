import "server-only";
import type { Session } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { isAdminEmail } from "@/config/admins";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";
import { clearRateLimit, consumeRateLimit } from "@/lib/rate-limit";
import { emailValue } from "@/lib/validation";
import { safeRedirectPath } from "@/lib/security-validation";
import { logSecurityEvent } from "@/lib/security-log";

const DUMMY_PASSWORD_HASH = "$2b$12$pJwTB3EwwpUpTokKVg/cvuE2HRk0EOgVqNgUEaF6PDxp6tkXU80Zy";

function assignedRole(email?: string | null): "admin" | "customer" {
  return isAdminEmail(email) ? "admin" : "customer";
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
        const email = emailValue(credentials?.email);
        const password = credentials?.password;

        if (!email || typeof password !== "string" || password.length === 0 || password.length > 128) {
          throw new Error("Invalid email or password");
        }

        const limit = await consumeRateLimit("credentials-login", email, 8, 15 * 60_000);
        if (!limit.allowed) {
          logSecurityEvent("credentials_login_rate_limited", { email });
          throw new Error("Invalid email or password");
        }

        if (assignedRole(email) === "admin") {
          await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
          logSecurityEvent("admin_credentials_login_denied", { email });
          throw new Error("Invalid email or password");
        }

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash +authVersion +emailVerifiedAt");
        const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
        const passwordMatches = await bcrypt.compare(password, passwordHash);

        if (!user?.passwordHash || !user.emailVerifiedAt || !passwordMatches) {
          if (user?.passwordHash && !user.emailVerifiedAt) {
            logSecurityEvent("unverified_credentials_login_denied", { email });
          }
          throw new Error("Invalid email or password");
        }

        await clearRateLimit("credentials-login", email);

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: assignedRole(user.email),
          authVersion: user.authVersion ?? 0,
        };
      },
    }),
  ],
  pages: { signIn: "/?login=true" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      if (!profile || !("email_verified" in profile) || profile.email_verified !== true) {
        logSecurityEvent("google_login_unverified_email_denied", { email: user.email.toLowerCase() });
        return false;
      }

      await connectDB();
      const email = user.email.toLowerCase();
      const role = assignedRole(email);
      let databaseUser = await User.findOne({ email }).select("+authVersion +passwordHash +emailVerifiedAt role");

      if (!databaseUser) {
        databaseUser = await User.create({ name: user.name ?? email, email, role, emailVerifiedAt: new Date() });
      } else {
        const wasUnverified = !databaseUser.emailVerifiedAt;
        if (databaseUser.role !== role) {
          databaseUser.role = role;
        }
        databaseUser.emailVerifiedAt ??= new Date();
        if (wasUnverified && databaseUser.passwordHash) {
          databaseUser.passwordHash = undefined;
          databaseUser.verificationToken = undefined;
          databaseUser.verificationTokenExpiry = undefined;
          databaseUser.authVersion = (databaseUser.authVersion ?? 0) + 1;
          logSecurityEvent("unverified_password_account_reclaimed_by_google", { email });
        }
        await databaseUser.save();
      }

      user.id = databaseUser._id.toString();
      user.role = role;
      user.authVersion = databaseUser.authVersion ?? 0;

      return true;
    },
    async jwt({ token, user }) {
      const email = emailValue(user?.email ?? token.email);
      if (email) {
        const calculatedRole = assignedRole(email);
        token.role = calculatedRole;
        if (user?.id) token.sub = user.id;
        if (user?.image) token.picture = user.image;

        await connectDB();
        const databaseUser = await User.findOne({ email }).select("_id +authVersion role");
        if (!databaseUser) {
          token.invalidated = true;
        } else {
          const currentAuthVersion = databaseUser.authVersion ?? 0;
          if (token.authVersion !== undefined && token.authVersion !== currentAuthVersion) {
            token.invalidated = true;
          } else {
            token.invalidated = false;
            token.authVersion = currentAuthVersion;
            if (!token.sub || !mongoose.isObjectIdOrHexString(token.sub)) token.sub = databaseUser._id.toString();
            if (databaseUser.role !== calculatedRole) {
              databaseUser.role = calculatedRole;
              await databaseUser.save();
            }
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.invalidated) {
          session.user.id = undefined;
          session.user.email = null;
          session.user.name = null;
          session.user.image = null;
          session.user.role = "customer";
        } else {
          session.user.id = token.sub;
          session.user.role = token.role === "admin" ? "admin" : "customer";
            if (token.picture) session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return new URL(safeRedirectPath(url, "/"), baseUrl).toString();
      try {
        return new URL(url).origin === new URL(baseUrl).origin ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
  events: {
    async signIn({ user, account }) {
      logSecurityEvent("authentication_success", {
        email: user.email?.toLowerCase(),
        provider: account?.provider,
      });
    },
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  jwt: { maxAge: 24 * 60 * 60 },
  useSecureCookies: process.env.NODE_ENV === "production",
};

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}
