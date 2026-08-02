/**
 * Inventory Module — offline validator E2E checks (Step 14.10).
 *
 * No HTTP server or MongoDB required.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/e2e-inventory.validators.ts
 */

import { Request } from "express";
import { validationResult, ValidationChain } from "express-validator";
import {
    adjustInventorySchema,
    getInventoryListQuerySchema,
    getInventoryMovementsQuerySchema,
    getLowStockReportQuerySchema,
    getMovementAnalyticsQuerySchema,
    getReservationReportQuerySchema,
    inventoryIdParamSchema,
    releaseInventorySchema,
    reserveInventorySchema,
} from "../src/modules/inventory/validations/inventory.validation";

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

const runChains = async (
    chains: ValidationChain[],
    req: Partial<Request>
): Promise<{ valid: boolean; message?: string }> => {
    const mockReq = {
        body: {},
        params: {},
        query: {},
        ...req,
    } as Request;

    for (const chain of chains) {
        await chain.run(mockReq);
    }

    const errors = validationResult(mockReq);
    if (errors.isEmpty()) {
        return { valid: true };
    }

    const first = errors.array({ onlyFirstError: true })[0];
    return {
        valid: false,
        message:
            first && "msg" in first ? String(first.msg) : "Validation failed.",
    };
};

const main = async (): Promise<void> => {
    const validId = "507f1f77bcf86cd799439011";

    // ObjectId
    {
        const bad = await runChains(inventoryIdParamSchema, {
            params: { id: "not-an-id" },
        });
        record("Rejects invalid ObjectId param", bad.valid === false, bad.message);
    }
    {
        const ok = await runChains(inventoryIdParamSchema, {
            params: { id: validId },
        });
        record("Accepts valid ObjectId param", ok.valid === true);
    }

    // Pagination
    {
        const bad = await runChains(getInventoryListQuerySchema, {
            query: { page: "0", limit: "20" },
        });
        record("Rejects invalid pagination (page=0)", bad.valid === false, bad.message);
    }
    {
        const bad = await runChains(getInventoryListQuerySchema, {
            query: { page: "1", limit: "999" },
        });
        record("Rejects invalid pagination (limit>100)", bad.valid === false, bad.message);
    }
    {
        const ok = await runChains(getInventoryListQuerySchema, {
            query: { page: "1", limit: "20", search: "SKU", isActive: "true" },
        });
        record("Accepts valid list query", ok.valid === true);
    }

    // Adjust quantity
    {
        const bad = await runChains(adjustInventorySchema, {
            params: { id: validId },
            body: { quantity: 0, reason: "noop" },
        });
        record("Rejects quantity=0 for adjust", bad.valid === false, bad.message);
    }
    {
        const bad = await runChains(adjustInventorySchema, {
            params: { id: validId },
            body: {},
        });
        record("Rejects missing quantity for adjust", bad.valid === false, bad.message);
    }
    {
        const ok = await runChains(adjustInventorySchema, {
            params: { id: validId },
            body: { quantity: -5, reason: "correction" },
        });
        record("Accepts negative quantity for adjust", ok.valid === true);
    }

    // Reserve
    {
        const bad = await runChains(reserveInventorySchema, {
            params: { id: validId },
            body: {
                quantity: 2,
                referenceType: "INVALID",
                referenceId: validId,
            },
        });
        record("Rejects invalid reservation enum", bad.valid === false, bad.message);
    }
    {
        const bad = await runChains(reserveInventorySchema, {
            params: { id: validId },
            body: { quantity: 2, referenceType: "ORDER" },
        });
        record(
            "Rejects missing referenceId for reserve",
            bad.valid === false,
            bad.message
        );
    }
    {
        const ok = await runChains(reserveInventorySchema, {
            params: { id: validId },
            body: {
                quantity: 2,
                referenceType: "ORDER",
                referenceId: validId,
            },
        });
        record("Accepts valid reserve body", ok.valid === true);
    }

    // Release
    {
        const bad = await runChains(releaseInventorySchema, {
            params: { id: validId },
            body: {},
        });
        record(
            "Rejects missing reservationId for release",
            bad.valid === false,
            bad.message
        );
    }

    // Movement type enum
    {
        const bad = await runChains(getInventoryMovementsQuerySchema, {
            params: { id: validId },
            query: { movementType: "BOGUS" },
        });
        record("Rejects invalid movementType enum", bad.valid === false, bad.message);
    }

    // Report filters
    {
        const bad = await runChains(getMovementAnalyticsQuerySchema, {
            query: { startDate: "not-a-date" },
        });
        record("Rejects invalid startDate", bad.valid === false, bad.message);
    }
    {
        const ok = await runChains(getLowStockReportQuerySchema, {
            query: { page: "1", limit: "10" },
        });
        record("Accepts low-stock report pagination", ok.valid === true);
    }
    {
        const ok = await runChains(getReservationReportQuerySchema, {
            query: { page: "1", limit: "10" },
        });
        record("Accepts reservation report pagination", ok.valid === true);
    }

    const failed = results.filter((r) => !r.ok);
    console.log(
        `\nInventory validators: ${results.length - failed.length}/${results.length} passed`
    );

    if (failed.length > 0) {
        process.exit(1);
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
