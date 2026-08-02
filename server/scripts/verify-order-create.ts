/**
 * Order Creation HTTP verification (Step 15.4).
 * Usage: npx ts-node --transpile-only scripts/verify-order-create.ts
 */

import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import mongoose, { Types } from "mongoose";

const BASE = (process.env.BASE_URL || "http://localhost:5000/api/v1").replace(
    /\/$/,
    ""
);

type Json = Record<string, unknown>;

const request = async (
    method: string,
    path: string,
    token: string,
    body?: unknown
): Promise<{ status: number; json: Json }> => {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let json: Json = {};
    try {
        json = (await res.json()) as Json;
    } catch {
        json = {};
    }
    return { status: res.status, json };
};

const shippingAddress = {
    fullName: "E2E Customer",
    phone: "9999999999",
    line1: "12 Market Street",
    city: "Mumbai",
    state: "MH",
    postalCode: "400001",
    country: "IN",
};

const run = async (): Promise<void> => {
    if (!process.env.MONGODB_URI || !process.env.JWT_ACCESS_SECRET) {
        throw new Error("MONGODB_URI and JWT_ACCESS_SECRET required.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("Mongo unavailable");
    }

    let user = await db.collection("users").findOne({ mobile: "8888888888" });
    if (!user) {
        const inserted = await db.collection("users").insertOne({
            firstName: "",
            lastName: "",
            mobile: "8888888888",
            email: "8888888888@e2e.local",
            role: "ADMIN",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        user = await db.collection("users").findOne({ _id: inserted.insertedId });
    } else {
        await db.collection("users").updateOne(
            { _id: user._id },
            { $set: { role: "ADMIN", isVerified: true } }
        );
        user = await db.collection("users").findOne({ _id: user._id });
    }
    if (!user) {
        throw new Error("Failed to seed admin user");
    }

    const actorId = user._id as Types.ObjectId;
    const productId = new Types.ObjectId();
    const variantId = new Types.ObjectId();

    await db.collection("products").deleteMany({ sku: "E2E-ORD-PRODUCT" });
    await db.collection("product_variants").deleteMany({ sku: "E2E-ORD-VARIANT" });
    await db.collection("inventories").deleteMany({ sku: "E2E-ORD-INV" });

    await db.collection("products").insertOne({
        _id: productId,
        name: "E2E Order Product",
        slug: `e2e-ord-product-${Date.now()}`,
        sku: "E2E-ORD-PRODUCT",
        shortDescription: "e2e",
        description: "e2e",
        price: 500,
        currency: "INR",
        quantity: 50,
        lowStockThreshold: 5,
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

    await db.collection("product_variants").insertOne({
        _id: variantId,
        product: productId,
        sku: "E2E-ORD-VARIANT",
        color: "Black",
        size: "M",
        price: 500,
        stock: 50,
        images: [],
        isActive: true,
        createdBy: actorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await db.collection("inventories").insertOne({
        product: productId,
        variant: variantId,
        sku: "E2E-ORD-INV",
        availableStock: 10,
        reservedStock: 0,
        totalStock: 10,
        reorderLevel: 2,
        isActive: true,
        createdBy: actorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const token = jwt.sign(
        {
            id: String(actorId),
            mobile: String(user.mobile),
            role: "ADMIN",
        },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: "1h" }
    );

    const rows: Array<{ name: string; expected: number; actual: number; ok: boolean; msg?: string }> = [];
    const check = (name: string, expected: number, actual: number, msg?: string) => {
        const ok = expected === actual;
        rows.push({ name, expected, actual, ok, msg });
        console.log(`[${ok ? "PASS" : "FAIL"}] ${name} expected=${expected} actual=${actual}${msg ? ` — ${msg}` : ""}`);
    };

    const valid = await request("POST", "/orders", token, {
        items: [{ productId: String(productId), variantId: String(variantId), quantity: 2 }],
        shippingAddress,
        currency: "INR",
        notes: "E2E order create",
    });
    check("Valid order creation", 201, valid.status, String(valid.json.message));

    const badProduct = await request("POST", "/orders", token, {
        items: [
            {
                productId: "507f1f77bcf86cd799439011",
                variantId: String(variantId),
                quantity: 1,
            },
        ],
        shippingAddress,
    });
    check("Invalid product", 404, badProduct.status, String(badProduct.json.message));

    const badVariant = await request("POST", "/orders", token, {
        items: [
            {
                productId: String(productId),
                variantId: "507f1f77bcf86cd799439011",
                quantity: 1,
            },
        ],
        shippingAddress,
    });
    check("Invalid variant", 404, badVariant.status, String(badVariant.json.message));

    const insufficient = await request("POST", "/orders", token, {
        items: [
            {
                productId: String(productId),
                variantId: String(variantId),
                quantity: 999999,
            },
        ],
        shippingAddress,
    });
    check(
        "Insufficient inventory",
        400,
        insufficient.status,
        String(insufficient.json.message)
    );

    await mongoose.disconnect();

    const failed = rows.filter((r) => !r.ok);
    console.log(`\nOrder create verification: ${rows.length - failed.length}/${rows.length} passed`);
    process.exit(failed.length ? 1 : 0);
};

run().catch(async (error) => {
    console.error(error);
    try {
        await mongoose.disconnect();
    } catch {
        // ignore
    }
    process.exit(1);
});
