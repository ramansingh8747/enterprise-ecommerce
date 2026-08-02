/**
 * Order Reports HTTP verification (Step 15.8).
 * Usage: npx ts-node --transpile-only scripts/verify-order-reports.ts
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

    const sign = (id: Types.ObjectId, mobile: string, role: string) =>
        jwt.sign(
            { id: String(id), mobile, role },
            process.env.JWT_ACCESS_SECRET as string,
            { expiresIn: "1h" }
        );

    const adminToken = sign(adminId, "8888888888", "ADMIN");
    const customerToken = sign(customerId, "7777777777", "CUSTOMER");

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

    const summary = await request(
        "GET",
        "/orders/reports/summary",
        adminToken
    );
    check(
        "GET /orders/reports/summary",
        200,
        summary.status,
        String(summary.json.message)
    );

    const revenue = await request(
        "GET",
        "/orders/reports/revenue",
        adminToken
    );
    check(
        "GET /orders/reports/revenue",
        200,
        revenue.status,
        String(revenue.json.message)
    );

    const statusReport = await request(
        "GET",
        "/orders/reports/status",
        adminToken
    );
    check(
        "GET /orders/reports/status",
        200,
        statusReport.status,
        String(statusReport.json.message)
    );

    const daily = await request("GET", "/orders/reports/daily", adminToken);
    check(
        "GET /orders/reports/daily",
        200,
        daily.status,
        String(daily.json.message)
    );

    const monthly = await request(
        "GET",
        "/orders/reports/monthly",
        adminToken
    );
    check(
        "GET /orders/reports/monthly",
        200,
        monthly.status,
        String(monthly.json.message)
    );

    const badRange = await request(
        "GET",
        "/orders/reports/summary?dateFrom=2026-12-31&dateTo=2026-01-01",
        adminToken
    );
    check(
        "Invalid date range → 400",
        400,
        badRange.status,
        String(badRange.json.message)
    );

    const badStatus = await request(
        "GET",
        "/orders/reports/summary?status=NOT_REAL",
        adminToken
    );
    check(
        "Invalid status filter → 400",
        400,
        badStatus.status,
        String(badStatus.json.message)
    );

    const denied = await request(
        "GET",
        "/orders/reports/summary",
        customerToken
    );
    check(
        "Unauthorized user → 403",
        403,
        denied.status,
        String(denied.json.message)
    );

    await mongoose.disconnect();

    const failed = rows.filter((r) => !r.ok);
    console.log(
        `\nOrder reports verification: ${rows.length - failed.length}/${rows.length} passed`
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
