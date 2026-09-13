import mongoose, { Schema, Document } from "mongoose";

import "server-only";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  emailVerifiedAt?: Date;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  role: "admin" | "customer";
  resetToken?: string;
  resetTokenExpiry?: Date;
  authVersion: number;
  phone?: string;
  address?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, select: false }, // Optional for Google OAuth users
    emailVerifiedAt: { type: Date, select: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date },
    authVersion: { type: Number, required: true, default: 0, min: 0, select: false },
    phone: { type: String, maxlength: 24 },
    address: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
