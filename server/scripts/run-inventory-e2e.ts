/**
 * Seeds fixtures and runs Inventory Module E2E (Step 14.10).
 *
 * Always runs:
 *   1) Validator suite (offline)
 *   2) InventoryService suite (MongoDB)
 *
 * Optionally runs HTTP smoke when BASE_URL is reachable:
 *   3) e2e-inventory.smoke.ts
 *
 * Usage:
 *   npm run test:inventory:e2e:seeded
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

    console.log("\n=== 1) Inventory validators (offline) ===");
    await runNodeScript("e2e-inventory.validators.ts", {});

    console.log("\n=== 2) InventoryService E2E (MongoDB) ===");
    await runNodeScript("e2e-inventory.service.ts", {
        MONGODB_URI: process.env.MONGODB_URI,
    });

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("MongoDB connection unavailable.");
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

    const actorId = adminUser._id;
    const productId = new Types.ObjectId();
    const warehouseId = new Types.ObjectId();
    const sku = "E2E-INV-HTTP-14-10";

    await db.collection("inventories").deleteMany({ sku });

    const inserted = await db.collection("inventories").insertOne({
        product: productId,
        warehouseId,
        sku,
        availableStock: 200,
        reservedStock: 0,
        totalStock: 200,
        reorderLevel: 10,
        isActive: true,
        createdBy: actorId,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const inventoryId = String(inserted.insertedId);

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
        console.log("\n=== 3) Inventory HTTP smoke (server detected) ===");
        await runNodeScript("e2e-inventory.smoke.ts", {
            ACCESS_TOKEN: adminToken,
            CUSTOMER_TOKEN: customerToken,
            INVENTORY_ID: inventoryId,
            BASE_URL,
        });
    } else {
        console.log(
            "\n=== 3) Inventory HTTP smoke skipped (server not reachable at /health) ==="
        );
        console.log(
            "Start the API (`npm run dev`) and re-run to include HTTP checks."
        );
    }

    console.log("\nInventory E2E seeded run complete.");
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
