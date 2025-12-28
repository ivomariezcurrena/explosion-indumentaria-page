import mongoose, { Schema, Document } from "mongoose";

export interface IProductImage {
  url: string;
  cloudinaryId: string;
}

export interface IProduct extends Document {
  title: string;
  price: number;
  description?: string;
  images: IProductImage[]; // Array de imágenes
  category?: mongoose.Types.ObjectId; // Referencia a categoría
  talles?: string[];
  colores?: string[];
  sexo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: { 
      type: [ProductImageSchema], 
      default: [],
      validate: {
        validator: function(v: IProductImage[]) {
          return v.length > 0; // Al menos una imagen
        },
        message: 'El producto debe tener al menos una imagen'
      }
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    talles: { type: [String], default: [] },
    colores: { type: [String], default: [] },
    sexo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
