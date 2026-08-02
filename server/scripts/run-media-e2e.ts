/**
 * Seeds fixtures and runs Media Module E2E (Step 13.10).
 *
 * Always runs:
 *   1) Validator suite (offline)
 *   2) MediaService suite with mock storage (MongoDB)
 *
 * Optionally runs HTTP smoke when BASE_URL is reachable:
 *   3) e2e-media.smoke.ts
 *
 * Usage:
 *   npm run test:media:e2e:seeded
 */

import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";
import { spawn } from "child_process";
import path from "path";

const BASE_URL = (
    process.env.BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const runNodeScript = (
    scriptRelative: string,
    env: NodeJS.ProcessEnv
): Promise<void> =>
    new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptRelative);
        const child = spawn(
            "npx",
            ["ts-node", "--transpile-only", scriptPath],
            {
                cwd: path.join(__dirname, ".."),
                env: { ...process.env, ...env },
                shell: true,
                stdio: "inherit",
            }
        );

        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`${scriptRelative} exited with code ${code}`));
        });
    });

const isServerUp = async (): Promise<boolean> => {
    try {
        const root = BASE_URL.replace(/\/api\/v1$/, "");
        const response = await fetch(`${root}/health`, {
            method: "GET",
        });
        return response.ok;
    } catch {
        return false;
    }
};

const run = async (): Promise<void> => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required.");
    }

    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is required.");
    }

    console.log("\n=== 1) Media validators (offline) ===");
    await runNodeScript("e2e-media.validators.ts", {});

    console.log("\n=== 2) MediaService E2E (mock storage) ===");
    await runNodeScript("e2e-media.service.ts", {
        MONGODB_URI: process.env.MONGODB_URI,
    });

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

    await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { role: "SUPER_ADMIN", isVerified: true } }
    );

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

    let product = await db
        .collection("products")
        .findOne({ sku: "E2E-MEDIA-PRODUCT" });
    if (!product) {
        const inserted = await db.collection("products").insertOne({
            name: "E2E Media Product",
            slug: "e2e-media-product",
            sku: "E2E-MEDIA-PRODUCT",
            shortDescription: "Seed product for media HTTP E2E",
            description: "Seed product for media HTTP E2E",
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
        product = await db.collection("products").findOne({ _id: inserted.insertedId });
    }

    if (!product) {
        throw new Error("Failed to seed product for Media E2E.");
    }

    const ensureUser = async (
        mobile: string,
        role: string
    ): Promise<{ _id: Types.ObjectId; mobile: string }> => {
        let existing = await db.collection("users").findOne({ mobile });

        if (!existing) {
            const inserted = await db.collection("users").insertOne({
                firstName: "",
                lastName: "",
                mobile,
                email: `${mobile}@e2e.local`,
                role,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            existing = await db
                .collection("users")
                .findOne({ _id: inserted.insertedId });
        } else {
            await db.collection("users").updateOne(
                { _id: existing._id },
                { $set: { role, isVerified: true } }
            );
            existing = await db.collection("users").findOne({ _id: existing._id });
        }

        if (!existing) {
            throw new Error(`Failed to seed user ${mobile}`);
        }

        return {
            _id: existing._id as Types.ObjectId,
            mobile: String(existing.mobile),
        };
    };

    const adminUser = await ensureUser("8888888888", "ADMIN");
    const customerUser = await ensureUser("7777777777", "CUSTOMER");

    const signToken = (
        u: { _id: Types.ObjectId; mobile: string },
        role: string
    ) =>
        jwt.sign(
            {
                id: String(u._id),
                mobile: u.mobile,
                role,
            },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "2h" }
        );

    const adminToken = signToken(adminUser, "ADMIN");
    const customerToken = signToken(customerUser, "CUSTOMER");

    await mongoose.disconnect();

    const serverUp = await isServerUp();
    if (serverUp) {
        console.log("\n=== 3) Media HTTP smoke (server detected) ===");
        await runNodeScript("e2e-media.smoke.ts", {
            ACCESS_TOKEN: adminToken,
            CUSTOMER_TOKEN: customerToken,
            PRODUCT_ID: String(product._id),
            BASE_URL,
        });
    } else {
        console.log(
            "\n=== 3) Media HTTP smoke skipped (server not reachable at /health) ==="
        );
        console.log(
            "Start the API (`npm run dev`) and re-run to include HTTP checks."
        );
    }

    console.log("\nMedia E2E seeded run complete.");
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
