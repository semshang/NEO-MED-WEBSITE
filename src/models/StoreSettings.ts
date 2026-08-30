import mongoose, { Schema, type Document } from "mongoose";

export interface IStoreSettings extends Document {
  key: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  notificationEmail: string;
  lowStockThreshold: number;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: { type: String, required: true, unique: true, default: "primary" },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    whatsapp: { type: String, required: true },
    address: { type: String, required: true },
    notificationEmail: { type: String, required: true, lowercase: true },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
  },
  { timestamps: true }
);

export default mongoose.models.StoreSettings || mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);
