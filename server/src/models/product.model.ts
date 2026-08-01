import mongoose, { Schema, Model } from "mongoose";
import {
    IProduct,
    ProductStatus,
    StockStatus,
} from "../interfaces/product.interface";

/**
 * Enterprise Product Mongoose schema.
 *
 * Persistence model for the Product aggregate.
 * Validation, defaults, and indexes only — no business logic.
 */
const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required."],
            trim: true,
            maxlength: [200, "Product name cannot exceed 200 characters."],
        },

        slug: {
            type: String,
            required: [true, "Product slug is required."],
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: [220, "Product slug cannot exceed 220 characters."],
        },

        sku: {
            type: String,
            required: [true, "Product SKU is required."],
            trim: true,
            uppercase: true,
            unique: true,
            maxlength: [64, "Product SKU cannot exceed 64 characters."],
        },

        shortDescription: {
            type: String,
            trim: true,
            default: "",
            maxlength: [500, "Short description cannot exceed 500 characters."],
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        price: {
            type: Number,
            required: [true, "Product price is required."],
            min: [0, "Product price cannot be negative."],
        },

        comparePrice: {
            type: Number,
            min: [0, "Compare price cannot be negative."],
        },

        costPrice: {
            type: Number,
            min: [0, "Cost price cannot be negative."],
        },

        currency: {
            type: String,
            required: [true, "Currency is required."],
            trim: true,
            uppercase: true,
            default: "INR",
            maxlength: [3, "Currency must be a 3-letter ISO code."],
        },

        quantity: {
            type: Number,
            required: [true, "Product quantity is required."],
            min: [0, "Product quantity cannot be negative."],
            default: 0,
        },

        lowStockThreshold: {
            type: Number,
            min: [0, "Low stock threshold cannot be negative."],
            default: 5,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Product category is required."],
        },

        brand: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
            required: [true, "Product brand is required."],
            index: true,
        },

        images: {
            type: [String],
            default: [],
        },

        thumbnail: {
            type: String,
            trim: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: {
                values: Object.values(ProductStatus),
                message: "Invalid product status.",
            },
            required: [true, "Product status is required."],
            default: ProductStatus.DRAFT,
        },

        stockStatus: {
            type: String,
            enum: {
                values: Object.values(StockStatus),
                message: "Invalid stock status.",
            },
            required: [true, "Stock status is required."],
            default: StockStatus.OUT_OF_STOCK,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isDigital: {
            type: Boolean,
            default: false,
        },

        weight: {
            type: Number,
            min: [0, "Weight cannot be negative."],
        },

        length: {
            type: Number,
            min: [0, "Length cannot be negative."],
        },

        width: {
            type: Number,
            min: [0, "Width cannot be negative."],
        },

        height: {
            type: Number,
            min: [0, "Height cannot be negative."],
        },

        seoTitle: {
            type: String,
            trim: true,
            maxlength: [70, "SEO title cannot exceed 70 characters."],
        },

        seoDescription: {
            type: String,
            trim: true,
            maxlength: [160, "SEO description cannot exceed 160 characters."],
        },

        seoKeywords: {
            type: [String],
            default: [],
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
        collection: "products",
    }
);

/**
 * Unique and lookup indexes for product catalog queries.
 * (sku / slug unique indexes are declared on schema paths)
 */
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isDigital: 1 });
productSchema.index({ price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 1 });

/**
 * Full-text search index for catalog and SEO discovery.
 */
productSchema.index(
    {
        name: "text",
        shortDescription: "text",
        description: "text",
        seoTitle: "text",
        seoDescription: "text",
    },
    {
        name: "product_text_search",
        weights: {
            name: 10,
            shortDescription: 5,
            seoTitle: 4,
            seoDescription: 2,
            description: 1,
        },
    }
);

/**
 * Product model — prevents overwrite on hot reload.
 */
const Product: Model<IProduct> =
    (mongoose.models.Product as Model<IProduct>) ||
    mongoose.model<IProduct>("Product", productSchema);

export default Product;
