import { ClientSession, Model, Types } from "mongoose";
import { ICreateMedia, IUpdateMedia } from "../interfaces/media.interface";
import Media, { IMediaDocument } from "../models/media.model";

/**
 * Selective fields exposed when attaching Media to Product responses.
 */
const PRODUCT_MEDIA_SELECT =
    "_id productId url secureUrl isPrimary displayOrder mediaType" as const;

/**
 * Lean Media summary shape used by Product ↔ Media integration.
 */
export interface IMediaLeanSummary {
    _id: Types.ObjectId;
    productId: Types.ObjectId;
    url: string;
    secureUrl?: string;
    isPrimary: boolean;
    displayOrder: number;
    mediaType: IMediaDocument["mediaType"];
}

/**
 * Enterprise Media Repository (Steps 13.4 / 13.6).
 *
 * Data-access layer for Media persistence (SRP).
 * Isolates MongoDB/Mongoose operations from the service layer.
 * No business rules, upload orchestration, or HTTP concerns.
 */
export class MediaRepository {
    private readonly mediaModel: Model<IMediaDocument>;

    /**
     * @param mediaModel - Injected Media model (defaults to Media).
     */
    constructor(mediaModel: Model<IMediaDocument> = Media) {
        this.mediaModel = mediaModel;
    }

    /**
     * Persists a new media document.
     */
    async create(data: ICreateMedia): Promise<IMediaDocument> {
        return this.mediaModel.create(data);
    }

    /**
     * Persists multiple media documents in one insert.
     */
    async createMany(data: ICreateMedia[]): Promise<IMediaDocument[]> {
        if (!data.length) {
            return [];
        }

        const docs = await this.mediaModel.insertMany(data, {
            ordered: true,
        });

        return docs as IMediaDocument[];
    }

    /**
     * Finds a media document by MongoDB ObjectId.
     */
    async findById(id: string): Promise<IMediaDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.mediaModel.findById(id).exec();
    }

    /**
     * Lists media for a Product, ordered by displayOrder then createdAt.
     */
    async findByProduct(productId: string): Promise<IMediaDocument[]> {
        if (!Types.ObjectId.isValid(productId)) {
            return [];
        }

        return this.mediaModel
            .find({ productId })
            .sort({ displayOrder: 1, createdAt: 1 })
            .exec();
    }

    /**
     * Selective Media summaries for one Product (Product ↔ Media reads).
     */
    async findSummariesByProduct(
        productId: string
    ): Promise<IMediaLeanSummary[]> {
        if (!Types.ObjectId.isValid(productId)) {
            return [];
        }

        return this.mediaModel
            .find({ productId })
            .select(PRODUCT_MEDIA_SELECT)
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean<IMediaLeanSummary[]>()
            .exec();
    }

    /**
     * Batch Media summaries for many Products (avoids N+1 on listings).
     */
    async findSummariesByProductIds(
        productIds: string[]
    ): Promise<IMediaLeanSummary[]> {
        const objectIds = productIds
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (!objectIds.length) {
            return [];
        }

        return this.mediaModel
            .find({ productId: { $in: objectIds } })
            .select(PRODUCT_MEDIA_SELECT)
            .sort({ displayOrder: 1, createdAt: 1 })
            .lean<IMediaLeanSummary[]>()
            .exec();
    }

    /**
     * Counts media documents for a Product.
     */
    async countByProduct(productId: string): Promise<number> {
        if (!Types.ObjectId.isValid(productId)) {
            return 0;
        }

        return this.mediaModel.countDocuments({ productId }).exec();
    }

    /**
     * Returns whether the Product already has a primary media record.
     */
    async hasPrimaryForProduct(productId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(productId)) {
            return false;
        }

        const existing = await this.mediaModel
            .exists({ productId, isPrimary: true })
            .exec();

        return existing !== null;
    }

    /**
     * Returns the maximum displayOrder for a Product (0 when none exist).
     */
    async getMaxDisplayOrder(productId: string): Promise<number> {
        if (!Types.ObjectId.isValid(productId)) {
            return 0;
        }

        const latest = await this.mediaModel
            .findOne({ productId })
            .sort({ displayOrder: -1 })
            .select("displayOrder")
            .lean<{ displayOrder?: number } | null>()
            .exec();

        return typeof latest?.displayOrder === "number"
            ? latest.displayOrder
            : 0;
    }

    /**
     * Deletes multiple media documents by id (rollback helper).
     */
    async deleteManyByIds(ids: string[]): Promise<number> {
        const objectIds = ids
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (!objectIds.length) {
            return 0;
        }

        const result = await this.mediaModel
            .deleteMany({ _id: { $in: objectIds } })
            .exec();

        return result.deletedCount ?? 0;
    }

    /**
     * Finds the primary media document for a Product (if any).
     */
    async findPrimaryByProduct(
        productId: string,
        session?: ClientSession
    ): Promise<IMediaDocument | null> {
        if (!Types.ObjectId.isValid(productId)) {
            return null;
        }

        return this.mediaModel
            .findOne({ productId, isPrimary: true })
            .session(session ?? null)
            .exec();
    }

    /**
     * Unsets isPrimary on all primary media for a Product.
     * Returns the number of modified documents.
     */
    async unsetPrimaryForProduct(
        productId: string,
        session?: ClientSession
    ): Promise<number> {
        if (!Types.ObjectId.isValid(productId)) {
            return 0;
        }

        const result = await this.mediaModel
            .updateMany(
                { productId, isPrimary: true },
                { $set: { isPrimary: false } },
                { session: session ?? undefined }
            )
            .exec();

        return result.modifiedCount ?? 0;
    }

    /**
     * Sets isPrimary=true on a Media document by id.
     */
    async setPrimaryById(
        mediaId: string,
        session?: ClientSession
    ): Promise<IMediaDocument | null> {
        if (!Types.ObjectId.isValid(mediaId)) {
            return null;
        }

        return this.mediaModel
            .findByIdAndUpdate(
                mediaId,
                { $set: { isPrimary: true } },
                {
                    new: true,
                    runValidators: true,
                    session: session ?? undefined,
                }
            )
            .exec();
    }

    /**
     * Finds a Media document by id scoped to a Product (ownership check).
     */
    async findByIdForProduct(
        mediaId: string,
        productId: string
    ): Promise<IMediaDocument | null> {
        if (
            !Types.ObjectId.isValid(mediaId) ||
            !Types.ObjectId.isValid(productId)
        ) {
            return null;
        }

        return this.mediaModel
            .findOne({ _id: mediaId, productId })
            .exec();
    }

    /**
     * Finds the next primary candidate for a Product (lowest displayOrder).
     */
    async findNextPrimaryCandidate(
        productId: string
    ): Promise<IMediaDocument | null> {
        if (!Types.ObjectId.isValid(productId)) {
            return null;
        }

        return this.mediaModel
            .findOne({ productId })
            .sort({ displayOrder: 1, createdAt: 1 })
            .exec();
    }

    /**
     * Re-sequences displayOrder to 1..n for a Product (sorted by current order).
     */
    async resequenceDisplayOrder(productId: string): Promise<void> {
        if (!Types.ObjectId.isValid(productId)) {
            return;
        }

        const docs = await this.mediaModel
            .find({ productId })
            .sort({ displayOrder: 1, createdAt: 1 })
            .select("_id")
            .lean<{ _id: Types.ObjectId }[]>()
            .exec();

        if (!docs.length) {
            return;
        }

        const operations = docs.map((doc, index) => ({
            updateOne: {
                filter: { _id: doc._id },
                update: { $set: { displayOrder: index + 1 } },
            },
        }));

        await this.mediaModel.bulkWrite(operations, { ordered: true });
    }

    /**
     * Updates a media document by id (data access only).
     */
    async updateById(
        id: string,
        data: IUpdateMedia
    ): Promise<IMediaDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.mediaModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
            .exec();
    }

    /**
     * Deletes a media document by id (hard delete — data access only).
     */
    async deleteById(id: string): Promise<IMediaDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return this.mediaModel.findByIdAndDelete(id).exec();
    }
}
