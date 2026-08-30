import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: "admin" | "customer";
  resetToken?: string;
  resetTokenExpiry?: Date;
  phone?: string;
  address?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String }, // Optional for Google OAuth users
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    phone: { type: String, maxlength: 24 },
    address: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
