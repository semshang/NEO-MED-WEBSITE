import "server-only";
import mongoose, { Schema, type Document } from "mongoose";

export interface IRateLimit extends Document {
  key: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true, maxlength: 160 },
    count: { type: Number, required: true, min: 1 },
    resetAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: false, versionKey: false },
);

export default mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
