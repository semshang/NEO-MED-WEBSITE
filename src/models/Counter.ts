import "server-only";
import mongoose, { Schema, type Document } from "mongoose";

export interface ICounter extends Document<string> {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);
