import mongoose, { Schema, Model } from "mongoose";
import { ICategory } from "../interfaces/category.interface";

/**
 * Enterprise Category Mongoose schema.
 *
 * Minimal catalog taxonomy model with optional parent hierarchy.
 * Relationships only — no business logic, middleware, or CRUD.
 */
const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required."],
            trim: true,
            maxlength: [120, "Category name cannot exceed 120 characters."],
        },

        slug: {
            type: String,
            required: [true, "Category slug is required."],
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: [140, "Category slug cannot exceed 140 characters."],
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [1000, "Category description cannot exceed 1000 characters."],
        },

        /**
         * Self-reference for nested category trees.
         * Root categories leave `parent` unset.
         */
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        level: {
            type: Number,
            min: [0, "Category level cannot be negative."],
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        sortOrder: {
            type: Number,
            default: 0,
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
        collection: "categories",
    }
);

/**
 * Lookup indexes for category navigation and filtering.
 * (slug unique index is declared on the schema path)
 */
categorySchema.index({ name: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });

/**
 * Category model — prevents overwrite on hot reload.
 */
const Category: Model<ICategory> =
    (mongoose.models.Category as Model<ICategory>) ||
    mongoose.model<ICategory>("Category", categorySchema);

export default Category;
