import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Enterprise Brand Mongoose document contract (foundation placeholder).
 *
 * Persistence-level TypeScript interface for the Brand aggregate.
 * Full field definitions, indexes, and virtuals will be added in the Brand Schema step.
 */
export interface IBrandDocument extends Document {
    _id: Types.ObjectId;

    name: string;
    slug: string;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Enterprise Brand Mongoose schema (foundation placeholder).
 *
 * Minimal stub so the module compiles and remains ready for schema expansion.
 * Validation, indexes, and merchandising fields land in the next step.
 */
const brandSchema = new Schema<IBrandDocument>(
    {
        name: {
            type: String,
            required: [true, "Brand name is required."],
            trim: true,
        },

        slug: {
            type: String,
            required: [true, "Brand slug is required."],
            trim: true,
            lowercase: true,
        },
    },
    {
        timestamps: true,
        collection: "brands",
        toJSON: {
            virtuals: true,
            versionKey: false,
        },
        toObject: {
            virtuals: true,
            versionKey: false,
        },
    }
);

/**
 * Brand model — prevents overwrite on hot reload.
 */
const Brand: Model<IBrandDocument> =
    (mongoose.models.Brand as Model<IBrandDocument>) ||
    mongoose.model<IBrandDocument>("Brand", brandSchema);

export default Brand;
export { Brand };
