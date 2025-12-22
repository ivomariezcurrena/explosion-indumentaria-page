import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  price: number;
  description?: string;
  imageUrl?: string;
  cloudinaryId?: string;
  talles?: string[];
  colores?: string[];
  sexo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    cloudinaryId: String,
    talles: { type: [String], default: [] },
    colores: { type: [String], default: [] },
    sexo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
