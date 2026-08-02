import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { StockMovementType } from "../types/inventory.types";

/**
 * Enterprise Stock Movement Mongoose document (Step 14.4).
 *
 * Append-only ledger entry. Do not update or soft-edit after insert.
 */
export interface IStockMovementDocument extends Document {
    _id: Types.ObjectId;

    inventory: Types.ObjectId;
    product: Types.ObjectId;
    variant?: Types.ObjectId;
    warehouseId?: Types.ObjectId;

    movementType: StockMovementType;
    quantity: number;

    previousAvailableStock: number;
    newAvailableStock: number;

    referenceType?: string;
    referenceId?: Types.ObjectId;
    notes?: string;

    performedBy: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Stock Movement schema — validation and indexes only.
 * No Inventory stock mutation or business calculations.
 */
const stockMovementSchema = new Schema<IStockMovementDocument>(
    {
        inventory: {
            type: Schema.Types.ObjectId,
            ref: "Inventory",
            required: [true, "Stock movement inventory is required."],
            index: true,
        },

        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Stock movement product is required."],
            index: true,
        },

        variant: {
            type: Schema.Types.ObjectId,
            ref: "ProductVariant",
            index: true,
        },

        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true,
        },

        movementType: {
            type: String,
            enum: {
                values: Object.values(StockMovementType),
                message: "Invalid movementType value.",
            },
            required: [true, "movementType is required."],
            index: true,
        },

        quantity: {
            type: Number,
            required: [true, "quantity is required."],
            min: [1, "quantity must be greater than 0."],
        },

        previousAvailableStock: {
            type: Number,
            required: [true, "previousAvailableStock is required."],
            min: [0, "previousAvailableStock cannot be negative."],
        },

        newAvailableStock: {
            type: Number,
            required: [true, "newAvailableStock is required."],
            min: [0, "newAvailableStock cannot be negative."],
        },

        referenceType: {
            type: String,
            trim: true,
            uppercase: true,
            maxlength: [64, "referenceType cannot exceed 64 characters."],
        },

        referenceId: {
            type: Schema.Types.ObjectId,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "notes cannot exceed 1000 characters."],
        },

        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "performedBy is required."],
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "stock_movements",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

stockMovementSchema.index({ createdAt: -1 });
stockMovementSchema.index({ inventory: 1, createdAt: -1 });
stockMovementSchema.index({ product: 1, createdAt: -1 });

/**
 * Enterprise Stock Movement model (append-only).
 */
export const StockMovement: Model<IStockMovementDocument> =
    mongoose.models.StockMovement ||
    mongoose.model<IStockMovementDocument>(
        "StockMovement",
        stockMovementSchema
    );

export default StockMovement;
