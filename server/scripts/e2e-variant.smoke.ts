/**
 * Product Variant Module — lightweight E2E smoke script.
 *
 * Usage:
 *   npx ts-node scripts/e2e-variant.smoke.ts
 *
 * Env:
 *   BASE_URL          default http://localhost:5000/api/v1
 *   ACCESS_TOKEN      ADMIN or SUPER_ADMIN JWT (required)
 *   SUPER_ADMIN_TOKEN SUPER_ADMIN JWT for DELETE (falls back to ACCESS_TOKEN)
 *   PRODUCT_ID        existing Product ObjectId (required)
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000/api/v1").replace(
    /\/$/,
    ""
);
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "";
const SUPER_ADMIN_TOKEN =
    process.env.SUPER_ADMIN_TOKEN || ACCESS_TOKEN;
const CUSTOMER_TOKEN = process.env.CUSTOMER_TOKEN || "";
const PRODUCT_ID = process.env.PRODUCT_ID || "";

type Json = Record<string, unknown>;

interface CheckResult {
    name: string;
    ok: boolean;
    detail?: string;
}

const results: CheckResult[] = [];

const record = (name: string, ok: boolean, detail?: string): void => {
    results.push({ name, ok, detail });
    const mark = ok ? "PASS" : "FAIL";
    console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
};

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
        "Content-Type": "application/json",
    };

    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    let body: Json = {};
    try {
        body = (await response.json()) as Json;
    } catch {
        body = {};
    }

    if (options.expectedStatus !== undefined) {
        const expected = Array.isArray(options.expectedStatus)
            ? options.expectedStatus
            : [options.expectedStatus];

        if (!expected.includes(response.status)) {
            throw new Error(
                `${method} ${path} expected ${expected.join("|")} got ${response.status}: ${JSON.stringify(body)}`
            );
        }
    }

    return { status: response.status, body };
};

const hasComputedFields = (variant: Json | undefined): boolean => {
    if (!variant) {
        return false;
    }

    return (
        typeof variant.finalPrice === "number" &&
        typeof variant.discountPercentage === "number" &&
        typeof variant.availabilityStatus === "string"
    );
};

const main = async (): Promise<void> => {
    if (!ACCESS_TOKEN || !PRODUCT_ID) {
        console.error(
            "ACCESS_TOKEN and PRODUCT_ID env vars are required to run this smoke script."
        );
        process.exit(1);
    }

    let variantId = "";
    let customSku = `E2E-SKU-${Date.now().toString(36).toUpperCase()}`;

    // Unauthorized
    try {
        await request("GET", "/variants", {
            token: null,
            expectedStatus: 401,
        });
        record("Unauthorized list without token", true);
    } catch (error) {
        record("Unauthorized list without token", false, String(error));
    }

    // Invalid JWT
    try {
        await request("GET", "/variants", {
            token: "invalid.jwt.token",
            expectedStatus: 401,
        });
        record("Invalid JWT rejected", true);
    } catch (error) {
        record("Invalid JWT rejected", false, String(error));
    }

    // Forbidden role (CUSTOMER)
    if (CUSTOMER_TOKEN) {
        try {
            await request("GET", "/variants", {
                token: CUSTOMER_TOKEN,
                expectedStatus: 403,
            });
            record("Customer role forbidden on list", true);
        } catch (error) {
            record("Customer role forbidden on list", false, String(error));
        }
    }

    // Missing required price (validation)
    try {
        await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 400,
            body: {
                product: PRODUCT_ID,
                color: "Yellow",
                size: "M",
                stock: 1,
            },
        });
        record("Missing price returns 400", true);
    } catch (error) {
        record("Missing price returns 400", false, String(error));
    }

    // Create with auto SKU
    try {
        const { body } = await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 201,
            body: {
                product: PRODUCT_ID,
                color: "Black",
                size: "128",
                price: 1000,
                salePrice: 800,
                stock: 10,
            },
        });

        const data = body.data as Json;
        variantId = String(data._id);
        const ok =
            body.success === true &&
            hasComputedFields(data) &&
            data.finalPrice === 800 &&
            data.discountPercentage === 20 &&
            data.availabilityStatus === "IN_STOCK";

        record("Create variant with auto SKU + pricing fields", ok, `id=${variantId}`);
    } catch (error) {
        record("Create variant with auto SKU + pricing fields", false, String(error));
    }

    // Create with custom SKU
    try {
        const { body } = await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 201,
            body: {
                product: PRODUCT_ID,
                sku: customSku,
                color: "Red",
                size: "M",
                price: 500,
                stock: 0,
            },
        });

        const data = body.data as Json;
        const ok =
            body.success === true &&
            String(data.sku).toUpperCase() === customSku.toUpperCase() &&
            data.availabilityStatus === "OUT_OF_STOCK" &&
            data.discountPercentage === 0 &&
            data.finalPrice === 500;

        record("Create variant with custom SKU", ok);
    } catch (error) {
        record("Create variant with custom SKU", false, String(error));
    }

    // Duplicate SKU
    try {
        await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 409,
            body: {
                product: PRODUCT_ID,
                sku: customSku,
                color: "Blue",
                size: "L",
                price: 600,
                stock: 1,
            },
        });
        record("Duplicate SKU returns 409", true);
    } catch (error) {
        record("Duplicate SKU returns 409", false, String(error));
    }

    // Invalid product
    try {
        await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 404,
            body: {
                product: "64b000000000000000000000",
                color: "Teal",
                size: "S",
                price: 100,
                stock: 1,
            },
        });
        record("Invalid product returns 404", true);
    } catch (error) {
        record("Invalid product returns 404", false, String(error));
    }

    // salePrice > price
    try {
        await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 400,
            body: {
                product: PRODUCT_ID,
                color: "Navy",
                size: "XL",
                price: 100,
                salePrice: 150,
                stock: 1,
            },
        });
        record("salePrice > price returns 400", true);
    } catch (error) {
        record("salePrice > price returns 400", false, String(error));
    }

    // Negative stock
    try {
        await request("POST", "/variants", {
            token: ACCESS_TOKEN,
            expectedStatus: 400,
            body: {
                product: PRODUCT_ID,
                color: "Gray",
                size: "XS",
                price: 100,
                stock: -5,
            },
        });
        record("Negative stock returns 400", true);
    } catch (error) {
        record("Negative stock returns 400", false, String(error));
    }

    if (!variantId) {
        console.error("Aborting remaining checks — no variantId from create.");
    } else {
        // Get by id
        try {
            const { body } = await request("GET", `/variants/${variantId}`, {
                token: ACCESS_TOKEN,
                expectedStatus: 200,
            });
            record(
                "Get variant by id",
                body.success === true && hasComputedFields(body.data as Json)
            );
        } catch (error) {
            record("Get variant by id", false, String(error));
        }

        // Invalid id format
        try {
            await request("GET", "/variants/not-a-mongo-id", {
                token: ACCESS_TOKEN,
                expectedStatus: 400,
            });
            record("Invalid variant id returns 400", true);
        } catch (error) {
            record("Invalid variant id returns 400", false, String(error));
        }

        // Non-existing id
        try {
            await request("GET", "/variants/64b000000000000000000000", {
                token: ACCESS_TOKEN,
                expectedStatus: 404,
            });
            record("Non-existing variant returns 404", true);
        } catch (error) {
            record("Non-existing variant returns 404", false, String(error));
        }

        // List with filters
        try {
            const { body } = await request(
                "GET",
                `/variants?page=1&limit=5&product=${PRODUCT_ID}&color=Black&isActive=true&minPrice=100&maxPrice=5000&search=128&sortBy=price&sortOrder=asc`,
                {
                    token: ACCESS_TOKEN,
                    expectedStatus: 200,
                }
            );

            const pagination = body.pagination as Json | undefined;
            const ok =
                body.success === true &&
                Array.isArray(body.data) &&
                typeof pagination === "object" &&
                typeof pagination?.page === "number" &&
                typeof pagination?.total === "number";

            record("List variants with filters/search/sort/pagination", ok);
        } catch (error) {
            record(
                "List variants with filters/search/sort/pagination",
                false,
                String(error)
            );
        }

        // Product variants
        try {
            const { body } = await request(
                "GET",
                `/products/${PRODUCT_ID}/variants`,
                {
                    token: ACCESS_TOKEN,
                    expectedStatus: 200,
                }
            );
            record(
                "Get variants by product",
                body.success === true && Array.isArray(body.data)
            );
        } catch (error) {
            record("Get variants by product", false, String(error));
        }

        // Update
        try {
            const { body } = await request("PUT", `/variants/${variantId}`, {
                token: ACCESS_TOKEN,
                expectedStatus: 200,
                body: {
                    price: 2000,
                    salePrice: 1500,
                    color: "Midnight",
                    size: "256",
                    stock: 25,
                },
            });

            const data = body.data as Json;
            const ok =
                body.success === true &&
                data.finalPrice === 1500 &&
                data.discountPercentage === 25 &&
                data.availabilityStatus === "IN_STOCK";

            record("Update variant pricing/inventory", ok);
        } catch (error) {
            record("Update variant pricing/inventory", false, String(error));
        }

        // Update duplicate SKU
        try {
            await request("PUT", `/variants/${variantId}`, {
                token: ACCESS_TOKEN,
                expectedStatus: 409,
                body: {
                    sku: customSku,
                },
            });
            record("Update duplicate SKU returns 409", true);
        } catch (error) {
            record("Update duplicate SKU returns 409", false, String(error));
        }

        // Stock set / increase / decrease
        try {
            const setRes = await request("PATCH", `/variants/${variantId}/stock`, {
                token: ACCESS_TOKEN,
                expectedStatus: 200,
                body: { operation: "set", stock: 10 },
            });
            const setData = setRes.body.data as Json;
            record(
                "Stock set",
                setData.stock === 10 && setData.previousStock !== undefined
            );

            const incRes = await request("PATCH", `/variants/${variantId}/stock`, {
                token: ACCESS_TOKEN,
                expectedStatus: 200,
                body: { operation: "increase", quantity: 5 },
            });
            const incData = incRes.body.data as Json;
            record("Stock increase", incData.stock === 15);

            const decRes = await request("PATCH", `/variants/${variantId}/stock`, {
                token: ACCESS_TOKEN,
                expectedStatus: 200,
                body: { operation: "decrease", quantity: 4 },
            });
            const decData = decRes.body.data as Json;
            record(
                "Stock decrease",
                decData.stock === 11 &&
                    (decData.availabilityStatus === "IN_STOCK" ||
                        decData.availabilityStatus === "LOW_STOCK")
            );
        } catch (error) {
            record("Stock set/increase/decrease", false, String(error));
        }

        // Prevent negative stock
        try {
            await request("PATCH", `/variants/${variantId}/stock`, {
                token: ACCESS_TOKEN,
                expectedStatus: 400,
                body: { operation: "decrease", quantity: 999999 },
            });
            record("Prevent negative stock decrease", true);
        } catch (error) {
            record("Prevent negative stock decrease", false, String(error));
        }

        // ADMIN cannot delete (SUPER_ADMIN only)
        try {
            await request("DELETE", `/variants/${variantId}`, {
                token: ACCESS_TOKEN,
                expectedStatus: 403,
            });
            record("Admin forbidden on delete", true);
        } catch (error) {
            record("Admin forbidden on delete", false, String(error));
        }

        // Delete
        try {
            await request("DELETE", `/variants/${variantId}`, {
                token: SUPER_ADMIN_TOKEN,
                expectedStatus: 200,
            });
            record("Delete variant (SUPER_ADMIN)", true);
        } catch (error) {
            record("Delete variant (SUPER_ADMIN)", false, String(error));
        }

        // Delete non-existing
        try {
            await request("DELETE", `/variants/${variantId}`, {
                token: SUPER_ADMIN_TOKEN,
                expectedStatus: 404,
            });
            record("Delete non-existing variant returns 404", true);
        } catch (error) {
            record("Delete non-existing variant returns 404", false, String(error));
        }
    }

    const failed = results.filter((r) => !r.ok);
    console.log("\n==============================");
    console.log(`Passed: ${results.length - failed.length}/${results.length}`);
    if (failed.length > 0) {
        console.log("Failed cases:");
        for (const item of failed) {
            console.log(` - ${item.name}: ${item.detail || ""}`);
        }
        process.exit(1);
    }

    console.log("Variant module E2E smoke checks passed.");
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
