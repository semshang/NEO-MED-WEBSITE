import mongoose, { Schema } from "mongoose";

import "server-only";

export interface ISpecification {
  label: string;
  value: string;
}

export interface IProductFAQ {
  question: string;
  answer: string;
}

export interface IProduct {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  slug: string;
  category: string;
  image: string;
  stock: number | null;
  price: number | null;
  description: string;
  isActive: boolean;
  active?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  shortDescription?: string;
  detailedDescription?: string;
  brand?: string;
  model?: string;
  features?: string[];
  applications?: string[];
  specifications?: ISpecification[];
  warranty?: string;
  installationSupport?: string;
  deliveryInformation?: string;
  faq?: IProductFAQ[];
  imageAlt?: string;
}

const SpecificationSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 200 },
    value: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const ProductFAQSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, trim: true, maxlength: 120 },
    image: { type: String, default: "", maxlength: 2048 },
    stock: { type: Number, default: null, min: 0 },
    price: { type: Number, default: null, min: 0 },
    description: { type: String, default: "", maxlength: 2000 },
    isActive: { type: Boolean, default: true, index: true },
    active: { type: Boolean },
    seoTitle: { type: String, default: "", maxlength: 160 },
    seoDescription: { type: String, default: "", maxlength: 500 },
    shortDescription: { type: String, default: "", maxlength: 500 },
    detailedDescription: { type: String, default: "", maxlength: 5000 },
    brand: { type: String, default: "", maxlength: 120 },
    model: { type: String, default: "", maxlength: 120 },
    features: { type: [{ type: String, maxlength: 300 }], default: [] },
    applications: { type: [{ type: String, maxlength: 300 }], default: [] },
    specifications: { type: [SpecificationSchema], default: [] },
    warranty: { type: String, default: "", maxlength: 500 },
    installationSupport: { type: String, default: "", maxlength: 500 },
    deliveryInformation: { type: String, default: "", maxlength: 500 },
    faq: { type: [ProductFAQSchema], default: [] },
    imageAlt: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
