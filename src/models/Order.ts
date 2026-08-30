import mongoose, { Schema, type Document } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/store-types";

export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number | null;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  customerNotes: string;
  status: OrderStatus;
  total: number | null;
  items: IOrderItem[];
  adminNotes: string;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, default: null, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerPhone: { type: String, required: true, trim: true, maxlength: 24 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    customerNotes: { type: String, default: "", maxlength: 2000 },
    status: { type: String, enum: ORDER_STATUSES, default: "New" },
    total: { type: Number, default: null, min: 0 },
    items: { type: [OrderItemSchema], required: true, validate: [(value: IOrderItem[]) => value.length > 0, "An order needs at least one item"] },
    adminNotes: { type: String, default: "", maxlength: 4000 },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
