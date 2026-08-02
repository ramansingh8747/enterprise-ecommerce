import {
    Model,
    QueryFilter,
    QueryOptions,
    SortOrder,
    Types,
    UpdateQuery,
} from "mongoose";
import Product from "../models/product.model";
import { IProduct } from "../interfaces/product.interface";
import {
    ProductListQuery,
    ProductSortOption,
} from "../interfaces/product-listing.interface";

/**
 * Selective Brand populate options for Product responses.
 */
const BRAND_POPULATE = {
    path: "brand",
    select: "_id name slug logo",
} as const;

/**
 * Enterprise Product Repository.
 *
 * Data-access layer for Product persistence (SRP).
 * Isolates MongoDB/Mongoose operations from the service layer (DIP).
 * No business rules, validation, or HTTP concerns.
 */
export class ProductRepository {
    private readonly productModel: Model<IProduct>;

    /**
     * @param productModel - Injected Product model (defaults to Product for composition root).
     */
    constructor(productModel: Model<IProduct> = Product) {
        this.productModel = productModel;
    }

    /**
     * Persists a new product document.
     * Returns the created Product with Brand populated via findById.
     */
    async create(product: Partial<IProduct>): Promise<IProduct> {
        const created = await this.productModel.create(product);
        const populated = await this.findById(created._id);

        if (!populated) {
            throw new Error("Product not found.");
        }

        return populated;
    }

    /**
     * Finds a product by MongoDB ObjectId with selective Brand populate.
     */
    async findById(
        id: string | Types.ObjectId
    ): Promise<IProduct | null> {
        return this.productModel
            .findById(id)
            .populate(BRAND_POPULATE)
            .lean<IProduct | null>()
            .exec();
    }

    /**
     * Finds a product by unique SKU.
     */
    async findBySku(sku: string): Promise<IProduct | null> {
        return this.productModel
            .findOne({ sku })
            .populate(BRAND_POPULATE)
            .lean<IProduct | null>()
            .exec();
    }

    /**
     * Finds a product by unique slug.
     */
    async findBySlug(slug: string): Promise<IProduct | null> {
        return this.productModel
            .findOne({ slug })
            .populate(BRAND_POPULATE)
            .lean<IProduct | null>()
            .exec();
    }

    /**
     * Finds products matching the provided filter.
     * Caller supplies filter and query options — no pagination/sort/search logic here.
     */
    async findAll(
        filter: QueryFilter<IProduct> = {},
        options: QueryOptions = {}
    ): Promise<IProduct[]> {
        return this.productModel
            .find(filter, null, options)
            .populate(BRAND_POPULATE)
            .lean<IProduct[]>()
            .exec();
    }

    /**
     * Lists products with dynamic search, filters, sort, and pagination.
     * Uses lean() for read performance. Populates Brand selectively.
     */
    async findByListing(
        query: ProductListQuery
    ): Promise<{ items: IProduct[]; total: number }> {
        const filter = this.buildListingFilter(query);
        const sort = this.buildListingSort(query.sort);
        const skip = (query.page - 1) * query.limit;

        const [items, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate(BRAND_POPULATE)
                .sort(sort)
                .skip(skip)
                .limit(query.limit)
                .lean<IProduct[]>()
                .exec(),
            this.productModel.countDocuments(filter).exec(),
        ]);

        return { items, total };
    }

    /**
     * Associates Media ObjectIds with a Product using $addToSet (no duplicates).
     */
    async addMediaReferences(
        productId: string | Types.ObjectId,
        mediaIds: Array<string | Types.ObjectId>
    ): Promise<IProduct | null> {
        if (!Types.ObjectId.isValid(String(productId))) {
            return null;
        }

        const objectIds = mediaIds
            .filter((id) => Types.ObjectId.isValid(String(id)))
            .map((id) => new Types.ObjectId(String(id)));

        if (!objectIds.length) {
            return this.findById(productId);
        }

        await this.productModel
            .findByIdAndUpdate(
                productId,
                {
                    $addToSet: {
                        media: { $each: objectIds },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
            .exec();

        return this.findById(productId);
    }

    /**
     * Removes a Media ObjectId reference from a Product ($pull).
     */
    async removeMediaReference(
        productId: string | Types.ObjectId,
        mediaId: string | Types.ObjectId
    ): Promise<IProduct | null> {
        if (
            !Types.ObjectId.isValid(String(productId)) ||
            !Types.ObjectId.isValid(String(mediaId))
        ) {
            return null;
        }

        await this.productModel
            .findByIdAndUpdate(
                productId,
                {
                    $pull: {
                        media: new Types.ObjectId(String(mediaId)),
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
            .exec();

        return this.findById(productId);
    }

    /**
     * Updates a product by id.
     * Returns the updated Product with Brand populated via findById.
     */
    async updateById(
        id: string | Types.ObjectId,
        update: UpdateQuery<IProduct>
    ): Promise<IProduct | null> {
        const updated = await this.productModel
            .findByIdAndUpdate(id, update, {
                new: true,
                runValidators: true,
            })
            .lean<IProduct | null>()
            .exec();

        if (!updated) {
            return null;
        }

        return this.findById(id);
    }

    /**
     * Hard-deletes a product by id and returns the deleted document.
     */
    async deleteById(
        id: string | Types.ObjectId
    ): Promise<IProduct | null> {
        return this.productModel
            .findByIdAndDelete(id)
            .populate(BRAND_POPULATE)
            .lean<IProduct | null>()
            .exec();
    }

    /**
     * Counts products matching the provided filter.
     */
    async count(filter: QueryFilter<IProduct> = {}): Promise<number> {
        return this.productModel.countDocuments(filter).exec();
    }

    /**
     * Returns whether at least one product matches the filter.
     */
    async exists(filter: QueryFilter<IProduct>): Promise<boolean> {
        const result = await this.productModel.exists(filter).exec();
        return result !== null;
    }

    /**
     * Builds a MongoDB filter from listing query parameters.
     */
    private buildListingFilter(
        query: ProductListQuery
    ): QueryFilter<IProduct> {
        const filter: QueryFilter<IProduct> = {};

        if (query.category) {
            filter.category = new Types.ObjectId(query.category);
        }

        if (query.brand) {
            filter.brand = new Types.ObjectId(query.brand);
        }

        if (query.status) {
            filter.status = query.status;
        }

        if (query.stockStatus) {
            filter.stockStatus = query.stockStatus;
        }

        if (typeof query.isFeatured === "boolean") {
            filter.isFeatured = query.isFeatured;
        }

        if (typeof query.isDigital === "boolean") {
            filter.isDigital = query.isDigital;
        }

        if (
            typeof query.minimumPrice === "number" ||
            typeof query.maximumPrice === "number"
        ) {
            const priceFilter: { $gte?: number; $lte?: number } = {};

            if (typeof query.minimumPrice === "number") {
                priceFilter.$gte = query.minimumPrice;
            }

            if (typeof query.maximumPrice === "number") {
                priceFilter.$lte = query.maximumPrice;
            }

            filter.price = priceFilter;
        }

        if (query.tags && query.tags.length > 0) {
            filter.tags = { $in: query.tags };
        }

        if (query.search && query.search.trim().length > 0) {
            const escaped = this.escapeRegex(query.search.trim());
            const searchRegex = new RegExp(escaped, "i");

            filter.$or = [
                { name: searchRegex },
                { sku: searchRegex },
                { slug: searchRegex },
                { shortDescription: searchRegex },
                { description: searchRegex },
                { tags: searchRegex },
            ];
        }

        return filter;
    }

    /**
     * Maps listing sort keys to MongoDB sort documents.
     */
    private buildListingSort(
        sort: ProductSortOption
    ): Record<string, SortOrder> {
        switch (sort) {
            case "oldest":
                return { createdAt: 1 };
            case "priceAsc":
                return { price: 1 };
            case "priceDesc":
                return { price: -1 };
            case "nameAsc":
                return { name: 1 };
            case "nameDesc":
                return { name: -1 };
            case "newest":
            default:
                return { createdAt: -1 };
        }
    }

    /**
     * Escapes user search input for safe RegExp usage.
     */
    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}
