import mongoose, { Query, Schema } from "mongoose";
import {
    BrandStatus,
    IBrandDocument,
    IBrandMethods,
    IBrandModel,
} from "../interfaces/brand.interface";

/**
 * Generates a URL-safe slug from raw text.
 */
const generateBrandSlug = (value: string): string => {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

/**
 * Enterprise Brand Mongoose schema.
 *
 * Persistence model for the Brand aggregate.
 * Validation, indexes, soft-delete query scope, and slug middleware.
 * Repository / service / controller logic lives outside this file.
 */
const brandSchema = new Schema<IBrandDocument, IBrandModel, IBrandMethods>(
    {
        name: {
            type: String,
            required: [true, "Brand name is required."],
            unique: true,
            trim: true,
            maxlength: [120, "Brand name cannot exceed 120 characters."],
        },

        slug: {
            type: String,
            required: [true, "Brand slug is required."],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: [140, "Brand slug cannot exceed 140 characters."],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [
                1000,
                "Brand description cannot exceed 1000 characters.",
            ],
        },

        /**
         * Optional Cloudinary (or CDN) logo URL.
         */
        logo: {
            type: String,
            trim: true,
        },

        website: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: {
                values: Object.values(BrandStatus),
                message: `Brand status must be one of: ${Object.values(BrandStatus).join(", ")}.`,
            },
            default: BrandStatus.ACTIVE,
            required: [true, "Brand status is required."],
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        seoTitle: {
            type: String,
            trim: true,
            maxlength: [150, "SEO title cannot exceed 150 characters."],
        },

        seoDescription: {
            type: String,
            trim: true,
            maxlength: [300, "SEO description cannot exceed 300 characters."],
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

        /**
         * Soft-delete timestamp. Null means the brand is not deleted.
         */
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "brands",
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

/**
 * Lookup indexes for brand listing and filtering.
 * Unique indexes for name/slug are declared on the schema paths via `unique: true`.
 */
brandSchema.index({ status: 1 });
brandSchema.index({ isFeatured: 1 });
brandSchema.index({ createdAt: -1 });

/**
 * Auto-generate slug from name when slug is missing.
 * Uses `validate` so `required` on slug succeeds before save.
 */
brandSchema.pre("validate", function () {
    if ((!this.slug || this.slug.trim().length === 0) && this.name) {
        this.slug = generateBrandSlug(this.name);
    }
});

/**
 * Soft-delete scope: exclude documents with deletedAt set.
 * Applies to find / findOne / findOneAnd* style queries.
 */
brandSchema.pre(/^find/, function (this: Query<unknown, IBrandDocument>) {
    this.where({ deletedAt: null });
});

/**
 * Soft-delete scope for countDocuments.
 */
brandSchema.pre(
    "countDocuments",
    function (this: Query<unknown, IBrandDocument>) {
        this.where({ deletedAt: null });
    }
);

/**
 * Placeholder static — find brand by slug.
 */
brandSchema.statics.findBySlug = function (
    slug: string
): Promise<IBrandDocument | null> {
    return this.findOne({ slug });
};

/**
 * Placeholder static — find ACTIVE brands.
 */
brandSchema.statics.findActive = function (): Promise<IBrandDocument[]> {
    return this.find({ status: BrandStatus.ACTIVE });
};

/**
 * Placeholder static — find featured brands.
 */
brandSchema.statics.findFeatured = function (): Promise<IBrandDocument[]> {
    return this.find({ isFeatured: true });
};

/**
 * Placeholder instance method — set status to ACTIVE and persist.
 */
brandSchema.methods.activate = async function (
    this: IBrandDocument
): Promise<IBrandDocument> {
    this.status = BrandStatus.ACTIVE;
    return this.save();
};

/**
 * Placeholder instance method — set status to INACTIVE and persist.
 */
brandSchema.methods.deactivate = async function (
    this: IBrandDocument
): Promise<IBrandDocument> {
    this.status = BrandStatus.INACTIVE;
    return this.save();
};

/**
 * Brand model — prevents overwrite on hot reload.
 */
const Brand =
    (mongoose.models.Brand as IBrandModel) ||
    mongoose.model<IBrandDocument, IBrandModel>("Brand", brandSchema);

export default Brand;
export { Brand };
