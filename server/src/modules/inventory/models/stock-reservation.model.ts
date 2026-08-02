import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { StockReservationStatus } from "../types/inventory.types";

/**
 * Enterprise Stock Reservation Mongoose document (Step 14.6).
 *
 * Soft hold on inventory — does not ship stock.
 * Inventory available/reserved field updates land in a later step.
 */
export interface IStockReservationDocument extends Document {
    _id: Types.ObjectId;

    inventory: Types.ObjectId;
    product: Types.ObjectId;
    variant?: Types.ObjectId;
    warehouseId?: Types.ObjectId;

    reservedQuantity: number;
    status: StockReservationStatus;

    referenceType: string;
    referenceId: Types.ObjectId;

    expiresAt?: Date;
    notes?: string;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Stock Reservation schema — validation and indexes only.
 */
const stockReservationSchema = new Schema<IStockReservationDocument>(
    {
        inventory: {
            type: Schema.Types.ObjectId,
            ref: "Inventory",
            required: [true, "Stock reservation inventory is required."],
            index: true,
        },

        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Stock reservation product is required."],
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

        reservedQuantity: {
            type: Number,
            required: [true, "reservedQuantity is required."],
            min: [1, "reservedQuantity must be greater than 0."],
        },

        status: {
            type: String,
            enum: {
                values: Object.values(StockReservationStatus),
                message: "Invalid reservation status.",
            },
            required: [true, "status is required."],
            default: StockReservationStatus.ACTIVE,
            index: true,
        },

        referenceType: {
            type: String,
            required: [true, "referenceType is required."],
            trim: true,
            uppercase: true,
            maxlength: [64, "referenceType cannot exceed 64 characters."],
        },

        referenceId: {
            type: Schema.Types.ObjectId,
            required: [true, "referenceId is required."],
            index: true,
        },

        expiresAt: {
            type: Date,
            index: true,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [1000, "notes cannot exceed 1000 characters."],
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
        collection: "stock_reservations",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

stockReservationSchema.index({ referenceType: 1, referenceId: 1 });
stockReservationSchema.index({ inventory: 1, status: 1 });

/**
 * Enterprise Stock Reservation model.
 */
export const StockReservation: Model<IStockReservationDocument> =
    mongoose.models.StockReservation ||
    mongoose.model<IStockReservationDocument>(
        "StockReservation",
        stockReservationSchema
    );

export default StockReservation;
