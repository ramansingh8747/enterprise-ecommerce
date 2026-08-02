/**
 * Order APIs HTTP verification (Step 15.7).
 * Usage: npx ts-node --transpile-only scripts/verify-order-apis.ts
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
    fullName: "E2E API Customer",
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

    const ensureUser = async (
        mobile: string,
        role: string
    ): Promise<Types.ObjectId> => {
        let user = await db.collection("users").findOne({ mobile });
        if (!user) {
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
            user = await db.collection("users").findOne({
                _id: inserted.insertedId,
            });
        } else {
            await db.collection("users").updateOne(
                { _id: user._id },
                { $set: { role, isVerified: true } }
            );
            user = await db.collection("users").findOne({ _id: user._id });
        }
        if (!user) {
            throw new Error(`Failed to seed user ${mobile}`);
        }
        return user._id as Types.ObjectId;
    };

    const adminId = await ensureUser("8888888888", "ADMIN");
    const customerId = await ensureUser("7777777777", "CUSTOMER");
    const otherCustomerId = await ensureUser("6666666666", "CUSTOMER");

    const productId = new Types.ObjectId();
    const variantId = new Types.ObjectId();

    await db.collection("products").deleteMany({ sku: "E2E-ORD-API-PRODUCT" });
    await db.collection("product_variants").deleteMany({
        sku: "E2E-ORD-API-VARIANT",
    });
    await db.collection("inventories").deleteMany({ sku: "E2E-ORD-API-INV" });

    await db.collection("products").insertOne({
        _id: productId,
        name: "E2E Order API Product",
        slug: `e2e-ord-api-product-${Date.now()}`,
        sku: "E2E-ORD-API-PRODUCT",
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
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await db.collection("product_variants").insertOne({
        _id: variantId,
        product: productId,
        sku: "E2E-ORD-API-VARIANT",
        color: "Black",
        size: "M",
        price: 500,
        stock: 50,
        images: [],
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await db.collection("inventories").insertOne({
        product: productId,
        variant: variantId,
        sku: "E2E-ORD-API-INV",
        availableStock: 50,
        reservedStock: 0,
        totalStock: 50,
        reorderLevel: 2,
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const sign = (id: Types.ObjectId, mobile: string, role: string) =>
        jwt.sign(
            { id: String(id), mobile, role },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "1h" }
        );

    const adminToken = sign(adminId, "8888888888", "ADMIN");
    const customerToken = sign(customerId, "7777777777", "CUSTOMER");
    const otherToken = sign(otherCustomerId, "6666666666", "CUSTOMER");

    const rows: Array<{
        name: string;
        expected: number;
        actual: number;
        ok: boolean;
        msg?: string;
    }> = [];
    const check = (
        name: string,
        expected: number,
        actual: number,
        msg?: string
    ) => {
        const ok = expected === actual;
        rows.push({ name, expected, actual, ok, msg });
        console.log(
            `[${ok ? "PASS" : "FAIL"}] ${name} expected=${expected} actual=${actual}${msg ? ` — ${msg}` : ""}`
        );
    };

    const pid = String(productId);
    const vid = String(variantId);

    // Customer: create
    const created = await request("POST", "/orders", customerToken, {
        items: [{ productId: pid, variantId: vid, quantity: 1 }],
        shippingAddress,
        currency: "INR",
        notes: "15.7 customer order",
    });
    check("Customer POST /orders → 201", 201, created.status, String(created.json.message));
    const createdData = (created.json.data as Json) || {};
    const orderDoc = (createdData.order as Json) || createdData;
    const customerOrderId = String(orderDoc._id || orderDoc.id);

    // Other customer order (for 403 test)
    const otherCreated = await request("POST", "/orders", otherToken, {
        items: [{ productId: pid, variantId: vid, quantity: 1 }],
        shippingAddress,
        currency: "INR",
    });
    if (otherCreated.status !== 201) {
        throw new Error(
            `Other customer create failed: ${otherCreated.status} ${JSON.stringify(otherCreated.json)}`
        );
    }
    const otherData = (otherCreated.json.data as Json) || {};
    const otherOrder = (otherData.order as Json) || otherData;
    const otherOrderId = String(otherOrder._id || otherOrder.id);

    // Customer list own
    const ownList = await request("GET", "/orders?page=1&limit=20", customerToken);
    check(
        "Customer GET own orders → 200",
        200,
        ownList.status,
        String(ownList.json.message)
    );

    // Customer get own
    const ownGet = await request(
        "GET",
        `/orders/${customerOrderId}`,
        customerToken
    );
    check(
        "Customer GET own order → 200",
        200,
        ownGet.status,
        String(ownGet.json.message)
    );

    // Customer get another's → 403
    const foreignGet = await request(
        "GET",
        `/orders/${otherOrderId}`,
        customerToken
    );
    check(
        "Customer GET another customer's order → 403",
        403,
        foreignGet.status,
        String(foreignGet.json.message)
    );

    // Customer PATCH status → 403
    const custPatch = await request(
        "PATCH",
        `/orders/${customerOrderId}/status`,
        customerToken,
        { status: "CONFIRMED" }
    );
    check(
        "Customer PATCH status → 403",
        403,
        custPatch.status,
        String(custPatch.json.message)
    );

    // Admin list all
    const adminList = await request(
        "GET",
        "/orders?page=1&limit=20",
        adminToken
    );
    check(
        "Admin GET all orders → 200",
        200,
        adminList.status,
        String(adminList.json.message)
    );

    // Admin filter status
    const byStatus = await request(
        "GET",
        "/orders?status=PENDING",
        adminToken
    );
    check(
        "Admin Filter by status → 200",
        200,
        byStatus.status,
        String(byStatus.json.message)
    );

    // Admin filter paymentStatus
    const byPay = await request(
        "GET",
        "/orders?paymentStatus=PENDING",
        adminToken
    );
    check(
        "Admin Filter by paymentStatus → 200",
        200,
        byPay.status,
        String(byPay.json.message)
    );

    // Admin PATCH status
    const adminPatch = await request(
        "PATCH",
        `/orders/${customerOrderId}/status`,
        adminToken,
        { status: "CONFIRMED" }
    );
    check(
        "Admin PATCH status → 200",
        200,
        adminPatch.status,
        String(adminPatch.json.message)
    );

    // Invalid order id → 404
    const missing = await request(
        "GET",
        "/orders/000000000000000000000000",
        adminToken
    );
    check(
        "Invalid Order ID → 404",
        404,
        missing.status,
        String(missing.json.message)
    );

    // Invalid pagination → 400
    const badPage = await request("GET", "/orders?page=0", adminToken);
    check(
        "Invalid Pagination → 400",
        400,
        badPage.status,
        String(badPage.json.message)
    );

    // Invalid filter → 400
    const badFilter = await request(
        "GET",
        "/orders?status=NOT_REAL",
        adminToken
    );
    check(
        "Invalid Filter → 400",
        400,
        badFilter.status,
        String(badFilter.json.message)
    );

    await mongoose.disconnect();

    const failed = rows.filter((r) => !r.ok);
    console.log(
        `\nOrder APIs verification: ${rows.length - failed.length}/${rows.length} passed`
    );
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
