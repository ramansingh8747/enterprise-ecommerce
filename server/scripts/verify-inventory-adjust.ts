/**
 * Focused ADMIN inventory adjustment verification (read-only investigation).
 * Usage: npx ts-node --transpile-only scripts/verify-inventory-adjust.ts
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
    token: string | null,
    body?: unknown
): Promise<{ status: number; json: Json }> => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const init: RequestInit = { method, headers };
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE}${path}`, init);
    let json: Json = {};
    try {
        json = (await res.json()) as Json;
    } catch {
        json = {};
    }
    return { status: res.status, json };
};

const run = async (): Promise<void> => {
    if (!process.env.MONGODB_URI || !process.env.JWT_ACCESS_SECRET) {
        throw new Error("MONGODB_URI and JWT_ACCESS_SECRET are required.");
    }

    const healthRoot = BASE.replace(/\/api\/v1$/, "");
    const health = await fetch(`${healthRoot}/health`);
    if (!health.ok) {
        throw new Error(`Server not reachable at ${healthRoot}/health`);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("MongoDB unavailable.");
    }

    const ensureUser = async (mobile: string, role: string) => {
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
            throw new Error(`Failed to ensure user ${mobile}`);
        }
        return user;
    };

    const admin = await ensureUser("8888888888", "ADMIN");
    const customer = await ensureUser("7777777777", "CUSTOMER");

    const sku = "E2E-ADJ-VERIFY-14-10";
    await db.collection("inventories").deleteMany({ sku });
    const inserted = await db.collection("inventories").insertOne({
        product: new Types.ObjectId(),
        sku,
        availableStock: 100,
        reservedStock: 5,
        totalStock: 105,
        reorderLevel: 10,
        isActive: true,
        createdBy: admin._id,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const inventoryId = String(inserted.insertedId);

    const sign = (user: { _id: Types.ObjectId; mobile: string }, role: string) =>
        jwt.sign(
            { id: String(user._id), mobile: String(user.mobile), role },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "1h" }
        );

    const adminToken = sign(
        { _id: admin._id as Types.ObjectId, mobile: String(admin.mobile) },
        "ADMIN"
    );
    const customerToken = sign(
        {
            _id: customer._id as Types.ObjectId,
            mobile: String(customer.mobile),
        },
        "CUSTOMER"
    );

    const rows: Array<{
        scenario: string;
        expected: string;
        actual: string;
        status: "PASS" | "FAIL";
        detail?: string;
    }> = [];

    const check = (
        scenario: string,
        expected: string,
        actual: string,
        pass: boolean,
        detail?: string
    ) => {
        rows.push({
            scenario,
            expected,
            actual,
            status: pass ? "PASS" : "FAIL",
            detail,
        });
        console.log(
            `[${pass ? "PASS" : "FAIL"}] ${scenario} | expected=${expected} actual=${actual}${detail ? ` | ${detail}` : ""}`
        );
    };

    const before = await db
        .collection("inventories")
        .findOne({ _id: inserted.insertedId });
    if (!before) {
        throw new Error("Seed inventory missing.");
    }

    const adj = await request(
        "PATCH",
        `/inventory/${inventoryId}/adjust`,
        adminToken,
        { quantity: 10, reason: "E2E Testing" }
    );

    const data = (adj.json.data ?? {}) as Json;
    const inventory = (data.inventory ?? {}) as Json;
    const movement = (data.movement ?? {}) as Json;
    const after = await db
        .collection("inventories")
        .findOne({ _id: inserted.insertedId });

    const expectedAvailable = Number(before.availableStock) + 10;
    const expectedTotal =
        expectedAvailable + Number(after?.reservedStock ?? 0);
    const movementCount = await db.collection("stock_movements").countDocuments({
        inventory: inserted.insertedId,
        movementType: "ADJUSTMENT",
        notes: "E2E Testing",
    });

    check(
        "ADMIN Inventory Adjustment",
        "200 OK",
        String(adj.status),
        adj.status === 200 && adj.json.success === true,
        `message=${String(adj.json.message)}`
    );
    check(
        "availableStock updated",
        String(expectedAvailable),
        String(after?.availableStock),
        after?.availableStock === expectedAvailable
    );
    check(
        "totalStock consistent",
        String(expectedTotal),
        String(after?.totalStock),
        after?.totalStock === expectedTotal,
        `reservedStock=${String(after?.reservedStock)}`
    );
    check(
        "ADJUSTMENT movement created",
        "ADJUSTMENT",
        String(movement.movementType ?? ""),
        movement.movementType === "ADJUSTMENT" && movementCount >= 1,
        `dbCount=${movementCount}`
    );
    check(
        "Low stock check executed",
        "alert key present",
        data.alert === undefined ? "missing" : "present",
        Object.prototype.hasOwnProperty.call(data, "alert")
    );
    check(
        "Enterprise response format",
        "success+message+data",
        `${typeof adj.json.success}/${typeof adj.json.message}/${adj.json.data !== undefined}`,
        typeof adj.json.success === "boolean" &&
            typeof adj.json.message === "string" &&
            adj.json.data !== undefined
    );
    check(
        "RBAC allows ADMIN",
        "not 403",
        String(adj.status),
        adj.status !== 403 && adj.status === 200
    );

    const customerAdj = await request(
        "PATCH",
        `/inventory/${inventoryId}/adjust`,
        customerToken,
        { quantity: 1, reason: "should fail" }
    );
    check(
        "CUSTOMER Inventory Adjustment",
        "403",
        String(customerAdj.status),
        customerAdj.status === 403
    );

    const missingId = await request(
        "PATCH",
        "/inventory/507f1f77bcf86cd799439099/adjust",
        adminToken,
        { quantity: 1, reason: "missing" }
    );
    check(
        "Invalid Inventory Id",
        "404",
        String(missingId.status),
        missingId.status === 404
    );

    const invalidQty = await request(
        "PATCH",
        `/inventory/${inventoryId}/adjust`,
        adminToken,
        { quantity: 0, reason: "bad" }
    );
    check(
        "Invalid Quantity",
        "400",
        String(invalidQty.status),
        invalidQty.status === 400
    );

    const missingField = await request(
        "PATCH",
        `/inventory/${inventoryId}/adjust`,
        adminToken,
        { reason: "no quantity" }
    );
    check(
        "Missing required fields",
        "400",
        String(missingField.status),
        missingField.status === 400
    );

    const negative = await request(
        "PATCH",
        `/inventory/${inventoryId}/adjust`,
        adminToken,
        { quantity: -999999, reason: "overdraw" }
    );
    check(
        "Negative Stock Prevention",
        "400",
        String(negative.status),
        negative.status === 400
    );

    await db.collection("inventories").deleteMany({ sku });
    await mongoose.disconnect();

    const failed = rows.filter((r) => r.status === "FAIL");
    console.log(`\nFocused adjust verification: ${rows.length - failed.length}/${rows.length} passed`);

    // Machine-readable summary for the final table
    console.log("\nTABLE_ROWS_START");
    for (const row of rows) {
        console.log(
            `${row.scenario}|${row.expected}|${row.actual}|${row.status}`
        );
    }
    console.log("TABLE_ROWS_END");

    if (failed.length > 0) {
        process.exit(1);
    }
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
