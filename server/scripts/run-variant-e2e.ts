/**
 * Seeds minimal catalog fixtures and runs Variant E2E smoke checks.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/run-variant-e2e.ts
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

const run = async (): Promise<void> => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required.");
    }

    if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is required.");
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

    await db.collection("users").updateOne(
        { _id: user._id },
        { $set: { role: "SUPER_ADMIN", isVerified: true } }
    );

    const actorId = user._id as Types.ObjectId;

    let brand = await db.collection("brands").findOne({ slug: "e2e-variant-brand" });
    if (!brand) {
        const brandInsert = await db.collection("brands").insertOne({
            name: "E2E Variant Brand",
            slug: "e2e-variant-brand",
            status: "ACTIVE",
            isFeatured: false,
            createdBy: actorId,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        brand = await db.collection("brands").findOne({ _id: brandInsert.insertedId });
    }

    let category = await db
        .collection("categories")
        .findOne({ slug: "e2e-variant-category" });
    if (!category) {
        const categoryInsert = await db.collection("categories").insertOne({
            name: "E2E Variant Category",
            slug: "e2e-variant-category",
            parentCategory: null,
            level: 0,
            path: "e2e-variant-category",
            sortOrder: 0,
            isActive: true,
            isFeatured: false,
            createdBy: actorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        category = await db
            .collection("categories")
            .findOne({ _id: categoryInsert.insertedId });
    }

    let product = await db
        .collection("products")
        .findOne({ sku: "E2E-VARIANT-PRODUCT" });
    if (!product) {
        const productInsert = await db.collection("products").insertOne({
            name: "E2E Variant Product",
            slug: "e2e-variant-product",
            sku: "E2E-VARIANT-PRODUCT",
            shortDescription: "Seed product for variant E2E",
            description: "Seed product for variant E2E",
            price: 1000,
            currency: "INR",
            quantity: 100,
            lowStockThreshold: 5,
            category: category?._id,
            brand: brand?._id,
            images: [],
            tags: ["e2e"],
            status: "ACTIVE",
            stockStatus: "IN_STOCK",
            isFeatured: false,
            isDigital: false,
            createdBy: actorId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        product = await db
            .collection("products")
            .findOne({ _id: productInsert.insertedId });
    }

    if (!product) {
        throw new Error("Failed to seed product for Variant E2E.");
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

    const signToken = (u: { _id: Types.ObjectId; mobile: string }, role: string) =>
        jwt.sign(
            {
                id: String(u._id),
                mobile: u.mobile,
                role,
            },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "2h" }
        );

    const superAdminToken = signToken(
        { _id: user._id as Types.ObjectId, mobile: String(user.mobile) },
        "SUPER_ADMIN"
    );
    const adminToken = signToken(adminUser, "ADMIN");
    const customerToken = signToken(customerUser, "CUSTOMER");

    await mongoose.disconnect();

    console.log("Seed ready.");
    console.log(`PRODUCT_ID=${product._id}`);
    console.log(`BASE_URL=${BASE_URL}`);

    const smokePath = path.join(__dirname, "e2e-variant.smoke.ts");

    await new Promise<void>((resolve, reject) => {
        const child = spawn(
            "npx",
            ["ts-node", "--transpile-only", smokePath],
            {
                cwd: path.join(__dirname, ".."),
                env: {
                    ...process.env,
                    ACCESS_TOKEN: adminToken,
                    SUPER_ADMIN_TOKEN: superAdminToken,
                    CUSTOMER_TOKEN: customerToken,
                    PRODUCT_ID: String(product._id),
                    BASE_URL,
                },
                shell: true,
                stdio: "inherit",
            }
        );

        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`Smoke script exited with code ${code}`));
        });
    });
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
