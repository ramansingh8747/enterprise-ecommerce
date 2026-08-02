/**
 * Order Status HTTP verification (Step 15.5).
 * Usage: npx ts-node --transpile-only scripts/verify-order-status.ts
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
    fullName: "E2E Status Customer",
    phone: "9999999999",
    line1: "12 Market Street",
    city: "Mumbai",
    state: "MH",
    postalCode: "400001",
    country: "IN",
};

const patchStatus = (
    token: string,
    orderId: string,
    status: string
): Promise<{ status: number; json: Json }> =>
    request("PATCH", `/orders/${orderId}/status`, token, { status });

const createOrder = async (
    token: string,
    productId: string,
    variantId: string
): Promise<string> => {
    const res = await request("POST", "/orders", token, {
        items: [{ productId, variantId, quantity: 1 }],
        shippingAddress,
        currency: "INR",
        notes: "E2E order status",
    });
    if (res.status !== 201) {
        throw new Error(
            `Create order failed: ${res.status} ${JSON.stringify(res.json)}`
        );
    }
    const data = res.json.data as Json;
    const order = (data.order as Json) || data;
    const id = String(order._id || order.id);
    if (!id || id === "undefined") {
        throw new Error(`No order id in create response: ${JSON.stringify(res.json)}`);
    }
    return id;
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

    await db.collection("products").deleteMany({ sku: "E2E-ORD-STATUS-PRODUCT" });
    await db.collection("product_variants").deleteMany({
        sku: "E2E-ORD-STATUS-VARIANT",
    });
    await db.collection("inventories").deleteMany({ sku: "E2E-ORD-STATUS-INV" });

    await db.collection("products").insertOne({
        _id: productId,
        name: "E2E Order Status Product",
        slug: `e2e-ord-status-product-${Date.now()}`,
        sku: "E2E-ORD-STATUS-PRODUCT",
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
        sku: "E2E-ORD-STATUS-VARIANT",
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
        sku: "E2E-ORD-STATUS-INV",
        availableStock: 50,
        reservedStock: 0,
        totalStock: 50,
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

    // Happy path
    const happyId = await createOrder(token, pid, vid);
    const happyChain = [
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
    ];
    let prev = "PENDING";
    for (const next of happyChain) {
        const res = await patchStatus(token, happyId, next);
        const data = (res.json.data as Json) || {};
        const order = (data.order as Json) || {};
        const newStatus = String(data.newStatus || order.orderStatus || "");
        check(
            `${prev} → ${next}`,
            200,
            res.status,
            newStatus === next
                ? String(res.json.message)
                : `status mismatch: ${newStatus}`
        );
        if (newStatus !== next && res.status === 200) {
            rows[rows.length - 1].ok = false;
        }
        prev = next;
    }

    // DELIVERED → PROCESSING → 400
    const deliveredId = await createOrder(token, pid, vid);
    for (const s of ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED"]) {
        const setup = await patchStatus(token, deliveredId, s);
        if (setup.status !== 200) {
            throw new Error(
                `Setup to ${s} failed: ${setup.status} ${JSON.stringify(setup.json)}`
            );
        }
    }
    {
        const res = await patchStatus(token, deliveredId, "PROCESSING");
        check(
            "DELIVERED → PROCESSING → 400",
            400,
            res.status,
            String(res.json.message)
        );
    }

    // SHIPPED → PENDING → 400
    const shippedId = await createOrder(token, pid, vid);
    for (const s of ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED"]) {
        const setup = await patchStatus(token, shippedId, s);
        if (setup.status !== 200) {
            throw new Error(
                `Setup to ${s} failed: ${setup.status} ${JSON.stringify(setup.json)}`
            );
        }
    }
    {
        const res = await patchStatus(token, shippedId, "PENDING");
        check(
            "SHIPPED → PENDING → 400",
            400,
            res.status,
            String(res.json.message)
        );
    }

    // CANCELLED → SHIPPED → 400
    const cancelledId = await createOrder(token, pid, vid);
    {
        const cancel = await patchStatus(token, cancelledId, "CANCELLED");
        if (cancel.status !== 200) {
            throw new Error(
                `Setup CANCELLED failed: ${cancel.status} ${JSON.stringify(cancel.json)}`
            );
        }
        const res = await patchStatus(token, cancelledId, "SHIPPED");
        check(
            "CANCELLED → SHIPPED → 400",
            400,
            res.status,
            String(res.json.message)
        );
    }

    // Invalid Order ID → 404
    {
        const res = await patchStatus(
            token,
            "000000000000000000000000",
            "CONFIRMED"
        );
        check("Invalid Order ID → 404", 404, res.status, String(res.json.message));
    }

    // Invalid Status → 400
    {
        const pendingId = await createOrder(token, pid, vid);
        const res = await patchStatus(token, pendingId, "NOT_A_REAL_STATUS");
        check("Invalid Status → 400", 400, res.status, String(res.json.message));
    }

    await mongoose.disconnect();

    const failed = rows.filter((r) => !r.ok);
    console.log(
        `\nOrder status verification: ${rows.length - failed.length}/${rows.length} passed`
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
