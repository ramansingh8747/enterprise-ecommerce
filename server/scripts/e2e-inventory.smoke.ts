/**
 * Inventory Module — HTTP E2E smoke (Step 14.10).
 *
 * Covers auth / RBAC / validation / operational + report endpoints.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/e2e-inventory.smoke.ts
 *
 * Env:
 *   BASE_URL, ACCESS_TOKEN, CUSTOMER_TOKEN, INVENTORY_ID
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000/api/v1").replace(
    /\/$/,
    ""
);
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "";
const CUSTOMER_TOKEN = process.env.CUSTOMER_TOKEN || "";
const INVENTORY_ID = process.env.INVENTORY_ID || "";

type Json = Record<string, unknown>;

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

const isEnterpriseEnvelope = (body: Json): boolean =>
    typeof body.success === "boolean" && typeof body.message === "string";

const request = async (
    method: string,
    path: string,
    options: {
        token?: string | null;
        body?: unknown;
        expectedStatus?: number | number[];
    } = {}
): Promise<{ status: number; body: Json }> => {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    let bodyInit: string | undefined;
    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
        bodyInit = JSON.stringify(options.body);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: bodyInit,
    });

    let body: Json = {};
    try {
        body = (await response.json()) as Json;
    } catch {
        body = {};
    }

    const expected = options.expectedStatus;
    if (expected !== undefined) {
        const allowed = Array.isArray(expected) ? expected : [expected];
        if (!allowed.includes(response.status)) {
            throw new Error(
                `${method} ${path} expected ${allowed.join("|")} got ${response.status}: ${JSON.stringify(body)}`
            );
        }
    }

    return { status: response.status, body };
};

const run = async (): Promise<void> => {
    if (!ACCESS_TOKEN) {
        throw new Error("ACCESS_TOKEN is required.");
    }
    if (!INVENTORY_ID) {
        throw new Error("INVENTORY_ID is required.");
    }

    // Auth
    {
        const { status, body } = await request("GET", "/inventory", {
            token: null,
            expectedStatus: 401,
        });
        record(
            "Unauthorized list → 401",
            status === 401 && isEnterpriseEnvelope(body),
            body.message as string
        );
    }

    // RBAC — customer forbidden (403)
    if (CUSTOMER_TOKEN) {
        const { status, body } = await request("GET", "/inventory", {
            token: CUSTOMER_TOKEN,
            expectedStatus: [401, 403],
        });
        record(
            "Customer list forbidden → 403/401",
            (status === 403 || status === 401) && isEnterpriseEnvelope(body),
            `${status} ${body.message}`
        );
    } else {
        record("Customer list forbidden → 403/401", false, "CUSTOMER_TOKEN missing");
    }

    // List / pagination / filters
    {
        const { status, body } = await request(
            "GET",
            "/inventory?page=1&limit=10&search=E2E-INV&isActive=true",
            { token: ACCESS_TOKEN, expectedStatus: 200 }
        );
        record(
            "GET /inventory list",
            status === 200 &&
                body.success === true &&
                Array.isArray(body.data) &&
                isEnterpriseEnvelope(body),
            body.message as string
        );
    }

    // Invalid pagination
    {
        const { status, body } = await request(
            "GET",
            "/inventory?page=0&limit=10",
            { token: ACCESS_TOKEN, expectedStatus: 400 }
        );
        record(
            "Invalid pagination → 400",
            status === 400 && body.success === false,
            body.message as string
        );
    }

    // Invalid ObjectId
    {
        const { status, body } = await request("GET", "/inventory/not-a-valid-id", {
            token: ACCESS_TOKEN,
            expectedStatus: 400,
        });
        record(
            "Invalid ObjectId → 400",
            status === 400 && body.success === false,
            body.message as string
        );
    }

    // Details
    {
        const { status, body } = await request(
            "GET",
            `/inventory/${INVENTORY_ID}`,
            { token: ACCESS_TOKEN, expectedStatus: 200 }
        );
        record(
            "GET /inventory/:id details",
            status === 200 && body.success === true && Boolean(body.data),
            body.message as string
        );
    }

    // 404
    {
        const { status, body } = await request(
            "GET",
            "/inventory/507f1f77bcf86cd799439099",
            { token: ACCESS_TOKEN, expectedStatus: 404 }
        );
        record(
            "Missing inventory → 404",
            status === 404 && body.success === false,
            body.message as string
        );
    }

    // Adjust increase
    {
        const { status, body } = await request(
            "PATCH",
            `/inventory/${INVENTORY_ID}/adjust`,
            {
                token: ACCESS_TOKEN,
                body: { quantity: 5, reason: "E2E-INV-14-10 http increase" },
                expectedStatus: 200,
            }
        );
        const data = body.data as Json | undefined;
        record(
            "PATCH adjust increase",
            status === 200 && body.success === true && Boolean(data?.movement),
            body.message as string
        );
    }

    // Adjust invalid quantity
    {
        const { status, body } = await request(
            "PATCH",
            `/inventory/${INVENTORY_ID}/adjust`,
            {
                token: ACCESS_TOKEN,
                body: { quantity: 0 },
                expectedStatus: 400,
            }
        );
        record(
            "Invalid adjust quantity → 400",
            status === 400 && body.success === false,
            body.message as string
        );
    }

    // Adjust overdraw
    {
        const { status, body } = await request(
            "PATCH",
            `/inventory/${INVENTORY_ID}/adjust`,
            {
                token: ACCESS_TOKEN,
                body: { quantity: -999999, reason: "E2E overdraw" },
                expectedStatus: 400,
            }
        );
        record(
            "Insufficient stock adjust → 400",
            status === 400 && body.success === false,
            body.message as string
        );
    }

    // Reserve
    const referenceId = "507f1f77bcf86cd799439011";
    let reservationId = "";
    {
        const { status, body } = await request(
            "POST",
            `/inventory/${INVENTORY_ID}/reserve`,
            {
                token: ACCESS_TOKEN,
                body: {
                    quantity: 2,
                    referenceType: "ORDER",
                    referenceId,
                },
                expectedStatus: 201,
            }
        );
        const data = body.data as Json | undefined;
        const reservation = data?.reservation as Json | undefined;
        reservationId = reservation?._id ? String(reservation._id) : "";
        record(
            "POST reserve stock",
            status === 201 && body.success === true && Boolean(reservationId),
            body.message as string
        );
    }

    // Invalid enum
    {
        const { status, body } = await request(
            "POST",
            `/inventory/${INVENTORY_ID}/reserve`,
            {
                token: ACCESS_TOKEN,
                body: {
                    quantity: 1,
                    referenceType: "NOPE",
                    referenceId,
                },
                expectedStatus: 400,
            }
        );
        record(
            "Invalid reserve enum → 400",
            status === 400 && body.success === false,
            body.message as string
        );
    }

    // Over-reserve
    {
        const { status, body } = await request(
            "POST",
            `/inventory/${INVENTORY_ID}/reserve`,
            {
                token: ACCESS_TOKEN,
                body: {
                    quantity: 999999,
                    referenceType: "ORDER",
                    referenceId: "507f1f77bcf86cd799439012",
                },
                expectedStatus: 400,
            }
        );
        record(
            "Insufficient reserve → 400",
            status === 400 && body.success === false,
            body.message as string
        );
    }

    // Movements
    {
        const { status, body } = await request(
            "GET",
            `/inventory/${INVENTORY_ID}/movements?page=1&limit=20`,
            { token: ACCESS_TOKEN, expectedStatus: 200 }
        );
        record(
            "GET movement history",
            status === 200 &&
                body.success === true &&
                Array.isArray(body.data),
            body.message as string
        );
    }

    // Release
    if (reservationId) {
        const { status, body } = await request(
            "POST",
            `/inventory/${INVENTORY_ID}/release`,
            {
                token: ACCESS_TOKEN,
                body: { reservationId, notes: "E2E-INV-14-10 http release" },
                expectedStatus: 200,
            }
        );
        record(
            "POST release reservation",
            status === 200 && body.success === true,
            body.message as string
        );
    } else {
        record("POST release reservation", false, "No reservationId");
    }

    // Alerts
    {
        const { status, body } = await request("GET", "/inventory/alerts", {
            token: ACCESS_TOKEN,
            expectedStatus: 200,
        });
        record(
            "GET low stock alerts",
            status === 200 &&
                body.success === true &&
                Array.isArray(body.data),
            body.message as string
        );
    }

    // Reports
    for (const [path, label] of [
        ["/inventory/reports/summary", "summary"],
        ["/inventory/reports/low-stock?page=1&limit=10", "low-stock"],
        ["/inventory/reports/movements", "movements"],
        ["/inventory/reports/reservations?page=1&limit=10", "reservations"],
    ] as const) {
        const { status, body } = await request("GET", path, {
            token: ACCESS_TOKEN,
            expectedStatus: 200,
        });
        record(
            `GET report ${label}`,
            status === 200 && body.success === true && body.data !== undefined,
            body.message as string
        );
    }

    // Customer cannot adjust (RBAC)
    if (CUSTOMER_TOKEN) {
        const { status, body } = await request(
            "PATCH",
            `/inventory/${INVENTORY_ID}/adjust`,
            {
                token: CUSTOMER_TOKEN,
                body: { quantity: 1, reason: "should fail" },
                expectedStatus: [401, 403],
            }
        );
        record(
            "Customer adjust forbidden",
            status === 403 || status === 401,
            `${status} ${body.message}`
        );
    }

    const failed = results.filter((r) => !r.ok);
    console.log(
        `\nInventory HTTP smoke: ${results.length - failed.length}/${results.length} passed`
    );

    if (failed.length > 0) {
        process.exit(1);
    }
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
