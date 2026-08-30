import mongoose, { Schema, type Document } from "mongoose";

export interface IContactMessage extends Document {
  customerId?: mongoose.Types.ObjectId;
  senderName: string;
  email: string;
  subject: string;
  body: string;
  unread: boolean;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    senderName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ContactMessage || mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
