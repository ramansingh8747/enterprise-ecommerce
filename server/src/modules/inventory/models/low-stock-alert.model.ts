import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { LowStockAlertStatus } from "../types/inventory.types";

/**
 * Enterprise Low Stock Alert Mongoose document (Step 14.7).
 *
 * Records that inventory fell to/below reorderLevel.
 * Does not mutate Inventory or send notifications.
 */
export interface ILowStockAlertDocument extends Document {
    _id: Types.ObjectId;

    inventory: Types.ObjectId;
    product: Types.ObjectId;
    variant?: Types.ObjectId;
    warehouseId?: Types.ObjectId;

    currentStock: number;
    reorderLevel: number;
    status: LowStockAlertStatus;
    message: string;

    triggeredAt: Date;
    resolvedAt?: Date;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Low Stock Alert schema — validation and indexes only.
 */
const lowStockAlertSchema = new Schema<ILowStockAlertDocument>(
    {
        inventory: {
            type: Schema.Types.ObjectId,
            ref: "Inventory",
            required: [true, "Low stock alert inventory is required."],
            index: true,
        },

        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Low stock alert product is required."],
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

        currentStock: {
            type: Number,
            required: [true, "currentStock is required."],
            min: [0, "currentStock cannot be negative."],
        },

        reorderLevel: {
            type: Number,
            required: [true, "reorderLevel is required."],
            min: [0, "reorderLevel cannot be negative."],
        },

        status: {
            type: String,
            enum: {
                values: Object.values(LowStockAlertStatus),
                message: "Invalid low stock alert status.",
            },
            required: [true, "status is required."],
            default: LowStockAlertStatus.ACTIVE,
            index: true,
        },

        message: {
            type: String,
            required: [true, "message is required."],
            trim: true,
            maxlength: [1000, "message cannot exceed 1000 characters."],
        },

        triggeredAt: {
            type: Date,
            required: [true, "triggeredAt is required."],
            default: Date.now,
            index: true,
        },

        resolvedAt: {
            type: Date,
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
        collection: "low_stock_alerts",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

lowStockAlertSchema.index({ inventory: 1, status: 1 });
lowStockAlertSchema.index({ status: 1, triggeredAt: -1 });

/**
 * Enterprise Low Stock Alert model.
 */
export const LowStockAlert: Model<ILowStockAlertDocument> =
    mongoose.models.LowStockAlert ||
    mongoose.model<ILowStockAlertDocument>(
        "LowStockAlert",
        lowStockAlertSchema
    );

export default LowStockAlert;
