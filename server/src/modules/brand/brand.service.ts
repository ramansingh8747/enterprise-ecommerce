import { Types } from "mongoose";
import {
    BrandStatus,
    IBrandDocument,
} from "../../interfaces/brand.interface";
import {
    BrandListQuery,
    BrandListSortBy,
    BrandRepository,
} from "./brand.repository";

/**
 * Default listing page size (aligned with Product / Category modules).
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const BRAND_SORT_OPTIONS: readonly BrandListSortBy[] = [
    "name",
    "createdAt",
    "updatedAt",
] as const;

const ALLOWED_STATUS_TRANSITIONS: ReadonlyMap<
    BrandStatus,
    ReadonlySet<BrandStatus>
> = new Map<BrandStatus, ReadonlySet<BrandStatus>>([
    [BrandStatus.ACTIVE, new Set<BrandStatus>([BrandStatus.INACTIVE])],
    [BrandStatus.INACTIVE, new Set<BrandStatus>([BrandStatus.ACTIVE])],
]);

/**
 * Authenticated actor performing brand mutations.
 */
export interface BrandActor {
    _id: string | Types.ObjectId;
}

/**
 * Raw listing input accepted from the controller (pre-normalization).
 */
export interface BrandListInput {
    keyword?: string;
    status?: string;
    isFeatured?: boolean;
    createdBy?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    fields?: string;
}

/**
 * Pagination metadata returned by brand listing.
 */
export interface BrandPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Enterprise brand listing result.
 */
export interface BrandListResult {
    data: IBrandDocument[];
    pagination: BrandPaginationMeta;
}

/**
 * Inbound create payload for Brand use cases.
 */
export interface CreateBrandInput {
    name: string;
    slug?: string;
    description?: string;
    logo?: string;
    website?: string;
    status?: BrandStatus | string;
    isFeatured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
}

/**
 * Inbound update payload for Brand use cases.
 */
export interface UpdateBrandInput {
    name?: string;
    slug?: string;
    description?: string;
    logo?: string;
    website?: string;
    status?: BrandStatus | string;
    isFeatured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
}

/**
 * Enterprise Brand Service.
 *
 * Application layer for Brand use cases (SRP).
 * Enforces domain rules and delegates persistence to BrandRepository (DIP).
 * Contains no HTTP, validation-schema, or direct model access.
 */
export class BrandService {
    constructor(private readonly brandRepository: BrandRepository) {}

    /**
     * Creates a brand after enforcing uniqueness and default status rules.
     */
    async createBrand(
        data: CreateBrandInput,
        currentUser: BrandActor
    ): Promise<IBrandDocument> {
        const name = data.name.trim();

        if (!name) {
            throw new Error("Brand name is required.");
        }

        await this.assertNameUnique(name);

        const slug = this.resolveSlug(data.slug, name);
        await this.assertSlugUnique(slug);

        const status = this.resolveCreateStatus(data.status);

        return this.brandRepository.create({
            name,
            slug,
            description: data.description,
            logo: data.logo,
            website: data.website,
            status,
            isFeatured: data.isFeatured ?? false,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            createdBy: this.toObjectId(currentUser._id),
            deletedAt: null,
        });
    }

    /**
     * Retrieves a brand by id.
     */
    async getBrandById(id: string): Promise<IBrandDocument> {
        const brand = await this.brandRepository.findById(id);

        if (!brand) {
            throw new Error("Brand not found.");
        }

        return brand;
    }

    /**
     * Retrieves a brand by slug.
     */
    async getBrandBySlug(slug: string): Promise<IBrandDocument> {
        const brand = await this.brandRepository.findBySlug(slug);

        if (!brand) {
            throw new Error("Brand not found.");
        }

        return brand;
    }

    /**
     * Lists brands with search, filters, sort, and pagination.
     * Soft-deleted brands are excluded by the Brand model query middleware.
     */
    async getAllBrands(
        rawQuery: BrandListInput = {}
    ): Promise<BrandListResult> {
        const query = this.normalizeListQuery(rawQuery);
        const { items, total } =
            await this.brandRepository.findByListing(query);

        const totalPages =
            total === 0 ? 0 : Math.ceil(total / query.limit);

        return {
            data: items,
            pagination: {
                total,
                page: query.page,
                limit: query.limit,
                totalPages,
                hasNext: query.page < totalPages,
                hasPrevious: query.page > 1 && totalPages > 0,
            },
        };
    }

    /**
     * Updates a brand after validating existence and uniqueness.
     */
    async updateBrand(
        id: string,
        data: UpdateBrandInput,
        currentUser: BrandActor
    ): Promise<IBrandDocument> {
        const existing = await this.brandRepository.findById(id);

        if (!existing) {
            throw new Error("Brand not found.");
        }

        const name =
            data.name !== undefined ? data.name.trim() : existing.name;

        if (!name) {
            throw new Error("Brand name is required.");
        }

        if (name !== existing.name) {
            await this.assertNameUnique(name, id);
        }

        const slug =
            data.slug !== undefined
                ? this.resolveSlug(data.slug, name)
                : existing.slug;

        if (slug !== existing.slug) {
            await this.assertSlugUnique(slug, id);
        }

        let status = existing.status;

        if (data.status !== undefined) {
            status = this.assertValidStatusTransition(
                existing.status,
                data.status
            );
        }

        const updated = await this.brandRepository.updateById(id, {
            name,
            slug,
            description:
                data.description !== undefined
                    ? data.description
                    : existing.description,
            logo: data.logo !== undefined ? data.logo : existing.logo,
            website:
                data.website !== undefined ? data.website : existing.website,
            status,
            isFeatured:
                data.isFeatured !== undefined
                    ? data.isFeatured
                    : existing.isFeatured,
            seoTitle:
                data.seoTitle !== undefined
                    ? data.seoTitle
                    : existing.seoTitle,
            seoDescription:
                data.seoDescription !== undefined
                    ? data.seoDescription
                    : existing.seoDescription,
            updatedBy: this.toObjectId(currentUser._id),
        });

        if (!updated) {
            throw new Error("Brand not found.");
        }

        return updated;
    }

    /**
     * Soft-deletes a brand (sets deletedAt; does not hard-delete).
     */
    async deleteBrand(id: string): Promise<IBrandDocument> {
        const existing = await this.brandRepository.findById(id);

        if (!existing) {
            throw new Error("Brand not found.");
        }

        const deleted = await this.brandRepository.softDelete(id);

        if (!deleted) {
            throw new Error("Brand not found.");
        }

        return deleted;
    }

    /**
     * Updates brand status after validating the transition.
     */
    async updateBrandStatus(
        id: string,
        nextStatus: BrandStatus | string
    ): Promise<IBrandDocument> {
        const existing = await this.brandRepository.findById(id);

        if (!existing) {
            throw new Error("Brand not found.");
        }

        const status = this.assertValidStatusTransition(
            existing.status,
            nextStatus
        );

        const updated = await this.brandRepository.updateStatus(id, status);

        if (!updated) {
            throw new Error("Brand not found.");
        }

        return updated;
    }

    /**
     * Applies listing business rules: defaults, bounds, and enum checks.
     */
    private normalizeListQuery(rawQuery: BrandListInput): BrandListQuery {
        return {
            keyword: rawQuery.keyword?.trim() || undefined,
            status: this.resolveOptionalStatus(rawQuery.status),
            isFeatured: rawQuery.isFeatured,
            createdBy: rawQuery.createdBy,
            sortBy: this.resolveSortBy(rawQuery.sortBy),
            sortDirection: this.resolveSortDirection(rawQuery.sortOrder),
            page: this.resolvePage(rawQuery.page),
            limit: this.resolveLimit(rawQuery.limit),
            fields: rawQuery.fields?.trim() || undefined,
        };
    }

    /**
     * Enforces global brand name uniqueness.
     */
    private async assertNameUnique(
        name: string,
        excludeId?: string
    ): Promise<void> {
        const existing = await this.brandRepository.findByName(name);

        if (!existing) {
            return;
        }

        if (excludeId && existing._id.toString() === excludeId) {
            return;
        }

        throw new Error("Brand with this name already exists.");
    }

    /**
     * Enforces global brand slug uniqueness.
     */
    private async assertSlugUnique(
        slug: string,
        excludeId?: string
    ): Promise<void> {
        const existing = await this.brandRepository.findBySlug(slug);

        if (!existing) {
            return;
        }

        if (excludeId && existing._id.toString() === excludeId) {
            return;
        }

        throw new Error("Brand with this slug already exists.");
    }

    /**
     * New brands default to ACTIVE; optional inbound status must be valid.
     */
    private resolveCreateStatus(
        status?: BrandStatus | string
    ): BrandStatus {
        if (status === undefined || status === null || status === "") {
            return BrandStatus.ACTIVE;
        }

        return this.parseStatus(status);
    }

    /**
     * Validates and applies an allowed status transition.
     */
    private assertValidStatusTransition(
        current: BrandStatus,
        nextRaw: BrandStatus | string
    ): BrandStatus {
        const next = this.parseStatus(nextRaw);

        if (current === next) {
            throw new Error(`Brand is already ${current}.`);
        }

        const allowed = ALLOWED_STATUS_TRANSITIONS.get(current);

        if (!allowed || !allowed.has(next)) {
            throw new Error(
                `Invalid brand status transition from ${current} to ${next}.`
            );
        }

        return next;
    }

    /**
     * Parses an optional status filter for listing.
     */
    private resolveOptionalStatus(
        status?: string
    ): BrandStatus | undefined {
        if (!status) {
            return undefined;
        }

        return this.parseStatus(status);
    }

    /**
     * Parses and validates a BrandStatus value.
     */
    private parseStatus(status: BrandStatus | string): BrandStatus {
        const normalized =
            typeof status === "string" ? status.trim().toUpperCase() : status;

        const values = Object.values(BrandStatus) as string[];

        if (!values.includes(normalized)) {
            throw new Error(
                `Invalid brand status. Allowed: ${values.join(", ")}.`
            );
        }

        return normalized as BrandStatus;
    }

    /**
     * Uses provided slug or generates one from the brand name.
     */
    private resolveSlug(slug: string | undefined, name: string): string {
        const source = slug && slug.trim().length > 0 ? slug : name;
        const generated = this.generateSlug(source);

        if (!generated) {
            throw new Error("Unable to generate a valid brand slug.");
        }

        return generated;
    }

    /**
     * Generates a URL-safe slug from raw text.
     */
    private generateSlug(value: string): string {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    private resolveSortBy(sortBy?: string): BrandListSortBy {
        if (!sortBy) {
            return "createdAt";
        }

        if ((BRAND_SORT_OPTIONS as readonly string[]).includes(sortBy)) {
            return sortBy as BrandListSortBy;
        }

        throw new Error(
            `Invalid sortBy. Allowed: ${BRAND_SORT_OPTIONS.join(", ")}.`
        );
    }

    private resolveSortDirection(sortOrder?: string): "asc" | "desc" {
        if (!sortOrder) {
            return "desc";
        }

        const normalized = sortOrder.trim().toLowerCase();

        if (normalized === "asc" || normalized === "desc") {
            return normalized;
        }

        throw new Error("sortOrder must be either asc or desc.");
    }

    private resolvePage(page?: number): number {
        if (typeof page !== "number" || Number.isNaN(page) || page < 1) {
            return DEFAULT_PAGE;
        }

        return Math.floor(page);
    }

    private resolveLimit(limit?: number): number {
        if (typeof limit !== "number" || Number.isNaN(limit) || limit < 1) {
            return DEFAULT_LIMIT;
        }

        return Math.min(Math.floor(limit), MAX_LIMIT);
    }

    /**
     * Converts an actor id into a Mongo ObjectId.
     */
    private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
        return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
    }
}
