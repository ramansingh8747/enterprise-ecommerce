import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Enterprise Category Mongoose document contract.
 *
 * Persistence-level TypeScript interface for the Category aggregate.
 * Supports nested taxonomy via parentCategory, level, and path.
 */
export interface ICategoryDocument extends Document {
    _id: Types.ObjectId;

    name: string;
    slug: string;
    description?: string;
    image?: string;

    parentCategory: Types.ObjectId | null;
    level: number;
    path: string;
    sortOrder: number;

    isActive: boolean;
    isFeatured: boolean;

    metaTitle?: string;
    metaDescription?: string;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;

    /** Virtual: number of direct child categories. */
    childrenCount?: number;
}

/**
 * Enterprise Category Mongoose schema.
 *
 * Persistence model for hierarchical catalog categories.
 * Validation, indexes, and virtuals only — no business logic.
 */
const categorySchema = new Schema<ICategoryDocument>(
    {
        name: {
            type: String,
            required: [true, "Category name is required."],
            trim: true,
            minlength: [2, "Category name must be at least 2 characters."],
            maxlength: [100, "Category name cannot exceed 100 characters."],
        },

        slug: {
            type: String,
            required: [true, "Category slug is required."],
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: [120, "Category slug cannot exceed 120 characters."],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Category description cannot exceed 1000 characters.",
            ],
        },

        /**
         * Optional Cloudinary image URL for category merchandising.
         */
        image: {
            type: String,
            trim: true,
        },

        /**
         * Self-reference for nested category trees.
         * Root categories use null.
         */
        parentCategory: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        /**
         * Hierarchy depth: 0 = root, 1 = child, 2 = grandchild, etc.
         */
        level: {
            type: Number,
            default: 0,
            min: [0, "Category level cannot be negative."],
        },

        /**
         * Materialized path for breadcrumb / tree queries.
         * Example: Electronics/Mobiles/Android
         */
        path: {
            type: String,
            trim: true,
            default: "",
        },

        sortOrder: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        metaTitle: {
            type: String,
            trim: true,
            maxlength: [150, "Meta title cannot exceed 150 characters."],
        },

        metaDescription: {
            type: String,
            trim: true,
            maxlength: [
                300,
                "Meta description cannot exceed 300 characters.",
            ],
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
 * Lookup indexes for taxonomy navigation and filtering.
 * (slug unique index is declared on the schema path)
 */
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

/**
 * Compound index for ordered children under a parent.
 */
categorySchema.index({ parentCategory: 1, sortOrder: 1 });

/**
 * Virtual: count of direct child categories.
 * Populate with: Category.find().populate("childrenCount")
 */
categorySchema.virtual("childrenCount", {
    ref: "Category",
    localField: "_id",
    foreignField: "parentCategory",
    count: true,
});

/**
 * Category model — prevents overwrite on hot reload.
 */
const Category: Model<ICategoryDocument> =
    (mongoose.models.Category as Model<ICategoryDocument>) ||
    mongoose.model<ICategoryDocument>("Category", categorySchema);

export default Category;
export { Category };
