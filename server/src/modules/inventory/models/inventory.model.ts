import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Enterprise Inventory Mongoose document contract (Step 14.2).
 *
 * Persistence-level TypeScript interface for the Inventory aggregate.
 * Links Product (required), ProductVariant (optional), and future Warehouse.
 */
export interface IInventoryDocument extends Document {
    _id: Types.ObjectId;

    product: Types.ObjectId;
    variant?: Types.ObjectId;
    warehouseId?: Types.ObjectId;

    sku: string;

    availableStock: number;
    reservedStock: number;
    totalStock: number;

    reorderLevel: number;
    isActive: boolean;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Enterprise Inventory Mongoose schema.
 *
 * Validation, defaults, and indexes only — no stock calculation or business logic.
 * totalStock is stored as provided; service-layer calc lands in a later step.
 */
const inventorySchema = new Schema<IInventoryDocument>(
    {
        /**
         * Parent Product — required catalog ownership.
         */
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Inventory product is required."],
            index: true,
        },

        /**
         * Optional ProductVariant for SKU-level stock.
         */
        variant: {
            type: Schema.Types.ObjectId,
            ref: "ProductVariant",
            index: true,
        },

        /**
         * Optional warehouse location (Warehouse module placeholder).
         * Stored as ObjectId; Warehouse model/population arrives later.
         */
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true,
        },

        sku: {
            type: String,
            required: [true, "Inventory SKU is required."],
            trim: true,
            uppercase: true,
            maxlength: [64, "Inventory SKU cannot exceed 64 characters."],
            index: true,
        },

        availableStock: {
            type: Number,
            required: [true, "availableStock is required."],
            min: [0, "availableStock cannot be negative."],
        },

        reservedStock: {
            type: Number,
            required: [true, "reservedStock is required."],
            min: [0, "reservedStock cannot be negative."],
            default: 0,
        },

        /**
         * Stored total — intended rule: availableStock + reservedStock.
         * Not auto-calculated in Step 14.2.
         */
        totalStock: {
            type: Number,
            required: [true, "totalStock is required."],
            min: [0, "totalStock cannot be negative."],
        },

        reorderLevel: {
            type: Number,
            required: [true, "reorderLevel is required."],
            min: [0, "reorderLevel cannot be negative."],
            default: 10,
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
        collection: "inventories",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

/**
 * Compound lookup helpers for multi-location / variant stock rows.
 */
inventorySchema.index({ product: 1, variant: 1, warehouseId: 1 });
inventorySchema.index({ product: 1, isActive: 1 });

/**
 * Enterprise Inventory model.
 */
export const Inventory: Model<IInventoryDocument> =
    mongoose.models.Inventory ||
    mongoose.model<IInventoryDocument>("Inventory", inventorySchema);

export default Inventory;
