/**
 * Media Module — in-process service E2E with mock StorageProvider (Step 13.10).
 *
 * Covers upload / primary / replace / delete / ownership / DB consistency.
 * No Cloudinary or HTTP server required (uses MONGODB_URI).
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/e2e-media.service.ts
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose, { Types } from "mongoose";
import { MediaRepository } from "../src/modules/media/repositories/media.repository";
import { MediaService } from "../src/modules/media/services/media.service";
import {
    IStorageProvider,
    IStorageUploadOptions,
    IStorageUploadResult,
    IUploadFileInput,
} from "../src/modules/media/interfaces/storage-provider.interface";
import { MediaType } from "../src/modules/media/types/media.types";
import { ProductRepository } from "../src/repositories/product.repository";
import Media from "../src/modules/media/models/media.model";
import Product from "../src/models/product.model";
// Register Brand schema for Product.populate("brand")
import "../src/modules/brand/models/brand.model";

interface CheckResult {
    name: string;
    ok: boolean;
    detail?: string;
}

const results: CheckResult[] = [];

const record = (name: string, ok: boolean, detail?: string): void => {
    results.push({ name, ok, detail });
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

/** Minimal 1×1 PNG */
const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
);

const makeFile = (name: string) => ({
    buffer: PNG,
    mimetype: "image/png",
    originalname: name,
    size: PNG.length,
});

class MockStorageProvider implements IStorageProvider {
    readonly name = "cloudinary";
    readonly assets = new Map<string, IStorageUploadResult>();
    failNextUpload = false;
    failNextDelete = false;

    async upload(
        file: IUploadFileInput,
        options?: IStorageUploadOptions
    ): Promise<IStorageUploadResult> {
        if (this.failNextUpload) {
            this.failNextUpload = false;
            throw new Error("Upload failure simulation.");
        }

        const publicId = `${options?.folder ?? "test"}/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;
        const result: IStorageUploadResult = {
            url: `https://cdn.example.com/${publicId}.png`,
            publicId,
            resourceType: MediaType.IMAGE,
            mimeType: file.mimetype,
            bytes: file.size ?? file.buffer.length,
            width: 1,
            height: 1,
            format: "png",
        };
        this.assets.set(publicId, result);
        return result;
    }

    async delete(publicId: string): Promise<void> {
        if (this.failNextDelete) {
            this.failNextDelete = false;
            throw new Error("Storage deletion failed.");
        }
        this.assets.delete(publicId);
    }
}

const run = async (): Promise<void> => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("MongoDB connection unavailable.");
    }

    const user =
        (await db.collection("users").findOne({ mobile: "9999999999" })) ||
        (await db.collection("users").findOne({}));

    if (!user) {
        throw new Error("No user found. Create an authenticated user first.");
    }

    const actorId = user._id as Types.ObjectId;

    let brand = await db.collection("brands").findOne({ slug: "e2e-media-brand" });
    if (!brand) {
        const inserted = await db.collection("brands").insertOne({
            name: "E2E Media Brand",
            slug: "e2e-media-brand",
            status: "ACTIVE",
            isFeatured: false,
            createdBy: actorId,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        brand = await db.collection("brands").findOne({ _id: inserted.insertedId });
    }

    let category = await db
        .collection("categories")
        .findOne({ slug: "e2e-media-category" });
    if (!category) {
        const inserted = await db.collection("categories").insertOne({
            name: "E2E Media Category",
            slug: "e2e-media-category",
            parentCategory: null,
            level: 0,
            path: "e2e-media-category",
            sortOrder: 0,
            isActive: true,
            isFeatured: false,
            createdBy: actorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        category = await db
            .collection("categories")
            .findOne({ _id: inserted.insertedId });
    }

    // Fresh product per run to isolate media state
    const sku = `E2E-MEDIA-${Date.now()}`;
    const productInsert = await db.collection("products").insertOne({
        name: "E2E Media Product",
        slug: `e2e-media-product-${Date.now()}`,
        sku,
        shortDescription: "Seed product for media E2E",
        description: "Seed product for media E2E",
        price: 500,
        currency: "INR",
        quantity: 50,
        lowStockThreshold: 5,
        category: category?._id,
        brand: brand?._id,
        images: [],
        media: [],
        tags: ["e2e", "media"],
        status: "ACTIVE",
        stockStatus: "IN_STOCK",
        isFeatured: false,
        isDigital: false,
        createdBy: actorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const productId = String(productInsert.insertedId);
    const otherProductInsert = await db.collection("products").insertOne({
        name: "E2E Media Other Product",
        slug: `e2e-media-other-${Date.now()}`,
        sku: `E2E-MEDIA-OTHER-${Date.now()}`,
        shortDescription: "Other",
        description: "Other",
        price: 100,
        currency: "INR",
        quantity: 10,
        lowStockThreshold: 5,
        category: category?._id,
        brand: brand?._id,
        images: [],
        media: [],
        tags: ["e2e"],
        status: "ACTIVE",
        stockStatus: "IN_STOCK",
        isFeatured: false,
        isDigital: false,
        createdBy: actorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const otherProductId = String(otherProductInsert.insertedId);

    const storage = new MockStorageProvider();
    const mediaRepository = new MediaRepository();
    const productRepository = new ProductRepository();
    const mediaService = new MediaService(
        mediaRepository,
        storage,
        productRepository
    );

    let mediaA = "";
    let mediaB = "";
    let mediaC = "";

    try {
        // --- Upload single ---
        const single = await mediaService.uploadProductImages({
            productId,
            files: [makeFile("a.png")],
            createdBy: String(actorId),
        });
        mediaA = single.uploaded[0]?.id ?? "";
        record(
            "Upload single image sets primary + displayOrder",
            single.uploaded.length === 1 &&
                single.uploaded[0]?.isPrimary === true &&
                typeof single.uploaded[0]?.displayOrder === "number",
            `id=${mediaA}`
        );
        record(
            "Storage asset created on upload",
            storage.assets.size === 1
        );

        // --- Upload multiple (primary unchanged) ---
        const multi = await mediaService.uploadProductImages({
            productId,
            files: [makeFile("b.png"), makeFile("c.png")],
            createdBy: String(actorId),
        });
        mediaB = multi.uploaded[0]?.id ?? "";
        mediaC = multi.uploaded[1]?.id ?? "";
        record(
            "Upload multiple preserves existing primary",
            multi.uploaded.every((item) => item.isPrimary === false) &&
                multi.uploaded.length === 2
        );

        const afterMulti = await Media.find({ productId }).sort({
            displayOrder: 1,
        });
        const primaryCount = afterMulti.filter((m) => m.isPrimary).length;
        record("Only one primary after multi upload", primaryCount === 1);
        record(
            "displayOrder sequential after uploads",
            afterMulti.map((m) => m.displayOrder).join(",") ===
                afterMulti
                    .map((_, i) => afterMulti[0].displayOrder + i)
                    .join(",")
        );

        const productDoc = await Product.findById(productId).lean();
        const refCount = Array.isArray(productDoc?.media)
            ? productDoc.media.length
            : 0;
        record("Product.media refs match uploaded count", refCount === 3);

        // --- Invalid product ---
        try {
            await mediaService.uploadProductImages({
                productId: new Types.ObjectId().toHexString(),
                files: [makeFile("x.png")],
            });
            record("Upload to nonexistent Product fails", false);
        } catch (error) {
            record(
                "Upload to nonexistent Product fails",
                error instanceof Error &&
                    error.message.toLowerCase().includes("not found")
            );
        }

        // --- Invalid MIME via service validation ---
        try {
            await mediaService.uploadProductImages({
                productId,
                files: [
                    {
                        buffer: Buffer.from("hello"),
                        mimetype: "text/plain",
                        originalname: "note.txt",
                        size: 5,
                    },
                ],
            });
            record("Upload invalid MIME fails", false);
        } catch {
            record("Upload invalid MIME fails", true);
        }

        // --- Empty upload ---
        try {
            await mediaService.uploadProductImages({
                productId,
                files: [],
            });
            record("Upload empty request fails", false);
        } catch {
            record("Upload empty request fails", true);
        }

        // --- Set primary ---
        const primarySwap = await mediaService.setProductPrimaryMedia(
            productId,
            mediaB
        );
        record(
            "Change primary image",
            primarySwap.isPrimary === true && primarySwap.mediaId === mediaB
        );
        const primaries = await Media.find({ productId, isPrimary: true });
        record("Exactly one primary after swap", primaries.length === 1);

        try {
            await mediaService.setProductPrimaryMedia(productId, mediaB);
            record("Change to current primary fails", false);
        } catch (error) {
            record(
                "Change to current primary fails",
                error instanceof Error &&
                    error.message.toLowerCase().includes("already")
            );
        }

        try {
            await mediaService.setProductPrimaryMedia(
                productId,
                new Types.ObjectId().toHexString()
            );
            record("Primary Media not found fails", false);
        } catch (error) {
            record(
                "Primary Media not found fails",
                error instanceof Error &&
                    error.message.toLowerCase().includes("not found")
            );
        }

        try {
            await mediaService.setProductPrimaryMedia(
                new Types.ObjectId().toHexString(),
                mediaB
            );
            record("Primary Product not found fails", false);
        } catch (error) {
            record(
                "Primary Product not found fails",
                error instanceof Error &&
                    error.message.toLowerCase().includes("not found")
            );
        }

        // Media on other product
        const otherUpload = await mediaService.uploadProductImages({
            productId: otherProductId,
            files: [makeFile("other.png")],
        });
        const otherMediaId = otherUpload.uploaded[0]?.id ?? "";
        try {
            await mediaService.setProductPrimaryMedia(productId, otherMediaId);
            record("Primary ownership mismatch fails", false);
        } catch (error) {
            record(
                "Primary ownership mismatch fails",
                error instanceof Error &&
                    error.message.toLowerCase().includes("belong")
            );
        }

        // --- Replace ---
        const beforeReplace = await Media.findById(mediaA);
        const oldPublicId = beforeReplace?.publicId;
        const assetsBeforeReplace = storage.assets.size;
        const replaced = await mediaService.replaceProductMedia(
            productId,
            mediaA,
            makeFile("a-replaced.png"),
            String(actorId)
        );
        record(
            "Replace preserves id / isPrimary / displayOrder",
            replaced.id === mediaA &&
                replaced.isPrimary === beforeReplace?.isPrimary &&
                replaced.displayOrder === beforeReplace?.displayOrder
        );
        record(
            "Replace removes old storage asset",
            !oldPublicId || !storage.assets.has(oldPublicId)
        );
        record(
            "Replace keeps storage size stable (±1)",
            Math.abs(storage.assets.size - assetsBeforeReplace) <= 1
        );

        try {
            await mediaService.replaceProductMedia(productId, mediaA, {
                buffer: Buffer.from("x"),
                mimetype: "application/pdf",
                originalname: "x.pdf",
                size: 1,
            });
            record("Replace unsupported MIME fails", false);
        } catch {
            record("Replace unsupported MIME fails", true);
        }

        storage.failNextUpload = true;
        const assetsBeforeFail = storage.assets.size;
        try {
            await mediaService.replaceProductMedia(
                productId,
                mediaA,
                makeFile("fail.png")
            );
            record("Replace upload failure rolls back", false);
        } catch {
            record(
                "Replace upload failure rolls back",
                storage.assets.size === assetsBeforeFail
            );
        }

        // --- Delete non-primary ---
        const assetsBeforeDelete = storage.assets.size;
        await mediaService.deleteProductMedia(productId, mediaC);
        record(
            "Delete non-primary image",
            (await Media.findById(mediaC)) === null
        );
        record(
            "Delete removes storage asset",
            storage.assets.size === assetsBeforeDelete - 1
        );
        const afterDeleteC = await Product.findById(productId).lean();
        record(
            "Delete removes Product media ref",
            !(afterDeleteC?.media ?? []).some(
                (id) => String(id) === mediaC
            )
        );

        // --- Delete primary with reassignment ---
        // Ensure mediaB is primary
        const currentPrimary = await Media.findOne({
            productId,
            isPrimary: true,
        });
        const primaryId = String(currentPrimary?._id);
        await mediaService.deleteProductMedia(productId, primaryId);
        const remaining = await Media.find({ productId }).sort({
            displayOrder: 1,
        });
        record(
            "Delete primary reassigns next image",
            remaining.length === 1 && remaining[0].isPrimary === true
        );
        record(
            "displayOrder resequenced after delete",
            remaining[0].displayOrder === 1
        );

        // --- Delete last image ---
        const lastId = String(remaining[0]._id);
        await mediaService.deleteProductMedia(productId, lastId);
        const noneLeft = await Media.find({ productId });
        record("Delete last image leaves zero media", noneLeft.length === 0);
        record(
            "No primary when no images remain",
            (await Media.countDocuments({ productId, isPrimary: true })) === 0
        );
        const emptyProduct = await Product.findById(productId).lean();
        record(
            "Product.media empty after last delete",
            Array.isArray(emptyProduct?.media) && emptyProduct.media.length === 0
        );

        // Ownership / invalid delete
        try {
            await mediaService.deleteProductMedia(
                productId,
                new Types.ObjectId().toHexString()
            );
            record("Delete invalid Media fails", false);
        } catch {
            record("Delete invalid Media fails", true);
        }

        try {
            await mediaService.deleteProductMedia(
                new Types.ObjectId().toHexString(),
                otherMediaId
            );
            record("Delete invalid Product fails", false);
        } catch {
            record("Delete invalid Product fails", true);
        }

        // Regression: Product repository still reads product
        const listed = await productRepository.findById(productId);
        record(
            "Product details still readable (backward compatible)",
            listed !== null && String(listed._id) === productId
        );

        // Orphan check for this product
        const orphanRefs = await Product.findById(productId).lean();
        const mediaIds = (
            await Media.find({ productId }).select("_id")
        ).map((m) => String(m._id));
        const broken = (orphanRefs?.media ?? []).some(
            (id) => !mediaIds.includes(String(id))
        );
        record("No broken Product media references", broken === false);

        // Cleanup other product media
        await Media.deleteMany({ productId: otherProductId });
        await Product.deleteOne({ _id: otherProductInsert.insertedId });
        await Media.deleteMany({ productId });
        await Product.deleteOne({ _id: productInsert.insertedId });
    } catch (error) {
        record("Unexpected suite error", false, String(error));
        await Media.deleteMany({ productId });
        await Media.deleteMany({ productId: otherProductId });
        await Product.deleteOne({ _id: productInsert.insertedId });
        await Product.deleteOne({ _id: otherProductInsert.insertedId });
    } finally {
        await mongoose.disconnect();
    }

    const failed = results.filter((r) => !r.ok);
    console.log("\n--- Media Service E2E Summary ---");
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
        process.exitCode = 1;
    }
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
