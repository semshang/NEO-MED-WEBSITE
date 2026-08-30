import mongoose, { Schema, type Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  image: string;
  stock: number | null;
  price: number | null;
  description: string;
  isActive: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, trim: true, maxlength: 120 },
    image: { type: String, default: "", maxlength: 2048 },
    stock: { type: Number, default: null, min: 0 },
    price: { type: Number, default: null, min: 0 },
    description: { type: String, default: "", maxlength: 2000 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
