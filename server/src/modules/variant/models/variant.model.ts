import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Enterprise Product Variant Mongoose document contract.
 *
 * Persistence-level TypeScript interface for the Variant aggregate.
 * Each variant belongs to exactly one Product.
 */
export interface IProductVariantDocument extends Document {
    _id: Types.ObjectId;

    product: Types.ObjectId;
    sku: string;

    color?: string;
    size?: string;

    price: number;
    salePrice?: number;
    stock: number;

    images: string[];
    isActive: boolean;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Enterprise Product Variant Mongoose schema.
 *
 * Persistence model for product variation (color/size/SKU/pricing/stock).
 * Validation, defaults, and indexes only — no business logic.
 */
const productVariantSchema = new Schema<IProductVariantDocument>(
    {
        /**
         * Parent Product reference — required one-to-many relationship.
         */
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Variant product is required."],
            index: true,
        },

        sku: {
            type: String,
            required: [true, "Variant SKU is required."],
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [64, "Variant SKU cannot exceed 64 characters."],
        },

        color: {
            type: String,
            trim: true,
            maxlength: [80, "Variant color cannot exceed 80 characters."],
        },

        size: {
            type: String,
            trim: true,
            maxlength: [80, "Variant size cannot exceed 80 characters."],
        },

        price: {
            type: Number,
            required: [true, "Variant price is required."],
            min: [0, "Variant price cannot be negative."],
        },

        salePrice: {
            type: Number,
            min: [0, "Variant sale price cannot be negative."],
        },

        stock: {
            type: Number,
            required: [true, "Variant stock is required."],
            min: [0, "Variant stock cannot be negative."],
            default: 0,
        },

        images: {
            type: [String],
            default: [],
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "createdBy is required."],
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "product_variants",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

/**
 * Lookup indexes for variant listing and filtering.
 * - product: declared via path `index: true`
 * - sku: declared via path `unique: true`
 * - isActive: declared via path `index: true`
 */
productVariantSchema.index({ product: 1, isActive: 1 });
productVariantSchema.index({ price: 1 });
productVariantSchema.index({ color: 1 });
productVariantSchema.index({ size: 1 });
productVariantSchema.index({ createdAt: -1 });

/**
 * Product Variant model — prevents overwrite on hot reload.
 */
const ProductVariant: Model<IProductVariantDocument> =
    (mongoose.models.ProductVariant as Model<IProductVariantDocument>) ||
    mongoose.model<IProductVariantDocument>(
        "ProductVariant",
        productVariantSchema
    );

export default ProductVariant;
export { ProductVariant };
