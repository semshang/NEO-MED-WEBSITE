import mongoose, { Schema, type Document } from "mongoose";

export interface ICustomerMeta extends Document {
  email: string;
  vip: boolean;
  notes: string;
}

const CustomerMetaSchema = new Schema<ICustomerMeta>(
  {
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    vip: { type: Boolean, default: false },
    notes: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true }
);

export default mongoose.models.CustomerMeta || mongoose.model<ICustomerMeta>("CustomerMeta", CustomerMetaSchema);
