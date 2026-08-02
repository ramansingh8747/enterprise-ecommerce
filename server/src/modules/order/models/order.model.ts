import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { ORDER_COLLECTIONS, ORDER_DEFAULTS } from "../constants/order.constants";
import { IOrderAddress } from "../interfaces/order.interface";
import { OrderItemMetadata } from "../types/order-item.types";
import {
    OrderStatus,
    PaymentStatus,
} from "../types/order.types";

/**
 * Embedded Order Item document shape (Step 15.3).
 *
 * Immutable purchase snapshot. lineTotal is stored as provided —
 * Order Service (15.4) owns calculation.
 */
export interface IOrderItemEmbedded {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    sku: string;
    productName: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    tax: number;
    lineTotal: number;
    currency: string;
    metadata?: OrderItemMetadata;
}

/**
 * Enterprise Order Mongoose document (Step 15.2).
 *
 * Persistence contract for the Order aggregate.
 * No creation, inventory, payment, or notification logic in this step.
 */
export interface IOrderDocument extends Document {
    _id: Types.ObjectId;

    orderNumber: string;
    customer: Types.ObjectId;

    items: IOrderItemEmbedded[];

    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;

    subtotal: number;
    discount: number;
    tax: number;
    shippingCharge: number;
    grandTotal: number;

    shippingAddress: IOrderAddress;
    billingAddress?: IOrderAddress;

    currency: string;
    notes?: string;
    placedAt: Date;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Address sub-schema — embedded snapshot only.
 */
const orderAddressSchema = new Schema<IOrderAddress>(
    {
        fullName: {
            type: String,
            required: [true, "Address fullName is required."],
            trim: true,
            maxlength: [120, "Address fullName cannot exceed 120 characters."],
        },
        phone: {
            type: String,
            trim: true,
            maxlength: [32, "Address phone cannot exceed 32 characters."],
        },
        line1: {
            type: String,
            required: [true, "Address line1 is required."],
            trim: true,
            maxlength: [200, "Address line1 cannot exceed 200 characters."],
        },
        line2: {
            type: String,
            trim: true,
            maxlength: [200, "Address line2 cannot exceed 200 characters."],
        },
        city: {
            type: String,
            required: [true, "Address city is required."],
            trim: true,
            maxlength: [100, "Address city cannot exceed 100 characters."],
        },
        state: {
            type: String,
            trim: true,
            maxlength: [100, "Address state cannot exceed 100 characters."],
        },
        postalCode: {
            type: String,
            required: [true, "Address postalCode is required."],
            trim: true,
            maxlength: [32, "Address postalCode cannot exceed 32 characters."],
        },
        country: {
            type: String,
            required: [true, "Address country is required."],
            trim: true,
            maxlength: [100, "Address country cannot exceed 100 characters."],
        },
    },
    { _id: false }
);

/**
 * Order item sub-schema — immutable product snapshot at purchase time.
 *
 * No indexes on embedded items (queried via parent Order indexes only).
 * No automatic lineTotal calculation.
 */
const orderItemSchema = new Schema<IOrderItemEmbedded>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Order item productId is required."],
        },
        variantId: {
            type: Schema.Types.ObjectId,
            ref: "ProductVariant",
            required: [true, "Order item variantId is required."],
        },
        sku: {
            type: String,
            required: [true, "Order item sku is required."],
            trim: true,
            uppercase: true,
            maxlength: [64, "Order item sku cannot exceed 64 characters."],
        },
        productName: {
            type: String,
            required: [true, "Order item productName is required."],
            trim: true,
            maxlength: [200, "Order item productName cannot exceed 200 characters."],
        },
        variantName: {
            type: String,
            trim: true,
            maxlength: [200, "Order item variantName cannot exceed 200 characters."],
        },
        unitPrice: {
            type: Number,
            required: [true, "Order item unitPrice is required."],
            min: [0, "Order item unitPrice cannot be negative."],
        },
        quantity: {
            type: Number,
            required: [true, "Order item quantity is required."],
            min: [1, "Order item quantity must be at least 1."],
        },
        discount: {
            type: Number,
            required: [true, "Order item discount is required."],
            min: [0, "Order item discount cannot be negative."],
            default: 0,
        },
        tax: {
            type: Number,
            required: [true, "Order item tax is required."],
            min: [0, "Order item tax cannot be negative."],
            default: 0,
        },
        lineTotal: {
            type: Number,
            required: [true, "Order item lineTotal is required."],
            min: [0, "Order item lineTotal cannot be negative."],
        },
        currency: {
            type: String,
            required: [true, "Order item currency is required."],
            trim: true,
            uppercase: true,
            maxlength: [8, "Order item currency cannot exceed 8 characters."],
            default: ORDER_DEFAULTS.CURRENCY,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    { _id: false }
);

/**
 * Enterprise Order schema — validation and indexes only.
 * Totals and snapshots are stored as provided; service calc lands later.
 */
const orderSchema = new Schema<IOrderDocument>(
    {
        orderNumber: {
            type: String,
            required: [true, "orderNumber is required."],
            trim: true,
            uppercase: true,
            maxlength: [64, "orderNumber cannot exceed 64 characters."],
            unique: true,
            index: true,
        },

        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "customer is required."],
            index: true,
        },

        items: {
            type: [orderItemSchema],
            required: [true, "Order items are required."],
            validate: {
                validator: (value: IOrderItemEmbedded[]) =>
                    Array.isArray(value) && value.length > 0,
                message: "Order must contain at least one item.",
            },
        },

        orderStatus: {
            type: String,
            enum: {
                values: Object.values(OrderStatus),
                message: "Invalid orderStatus.",
            },
            required: [true, "orderStatus is required."],
            default: ORDER_DEFAULTS.STATUS,
            index: true,
        },

        paymentStatus: {
            type: String,
            enum: {
                values: Object.values(PaymentStatus),
                message: "Invalid paymentStatus.",
            },
            required: [true, "paymentStatus is required."],
            default: ORDER_DEFAULTS.PAYMENT_STATUS,
            index: true,
        },

        subtotal: {
            type: Number,
            required: [true, "subtotal is required."],
            min: [0, "subtotal cannot be negative."],
        },

        discount: {
            type: Number,
            required: [true, "discount is required."],
            min: [0, "discount cannot be negative."],
            default: 0,
        },

        tax: {
            type: Number,
            required: [true, "tax is required."],
            min: [0, "tax cannot be negative."],
            default: 0,
        },

        shippingCharge: {
            type: Number,
            required: [true, "shippingCharge is required."],
            min: [0, "shippingCharge cannot be negative."],
            default: 0,
        },

        grandTotal: {
            type: Number,
            required: [true, "grandTotal is required."],
            min: [0, "grandTotal cannot be negative."],
        },

        shippingAddress: {
            type: orderAddressSchema,
            required: [true, "shippingAddress is required."],
        },

        billingAddress: {
            type: orderAddressSchema,
        },

        currency: {
            type: String,
            required: [true, "currency is required."],
            trim: true,
            uppercase: true,
            maxlength: [8, "currency cannot exceed 8 characters."],
            default: ORDER_DEFAULTS.CURRENCY,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: [2000, "notes cannot exceed 2000 characters."],
        },

        placedAt: {
            type: Date,
            required: [true, "placedAt is required."],
            default: Date.now,
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
        collection: ORDER_COLLECTIONS.ORDERS,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

orderSchema.index({ customer: 1, placedAt: -1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });

/**
 * Enterprise Order model.
 */
export const Order: Model<IOrderDocument> =
    mongoose.models.Order ||
    mongoose.model<IOrderDocument>("Order", orderSchema);

export default Order;
