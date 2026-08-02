/**
 * Product Media Module — HTTP E2E smoke (Step 13.10).
 *
 * Covers auth / RBAC / validation negatives always.
 * Positive upload/replace/delete/primary run when Cloudinary is configured
 * (SKIP_MEDIA_UPLOAD_POSITIVES=1 to force-skip).
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/e2e-media.smoke.ts
 *
 * Env:
 *   BASE_URL, ACCESS_TOKEN, CUSTOMER_TOKEN, PRODUCT_ID
 *   CLOUDINARY_* (optional — enables positive upload flows)
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000/api/v1").replace(
    /\/$/,
    ""
);
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "";
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
    console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
};

const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
);

const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
);

const runPositives =
    cloudinaryConfigured && process.env.SKIP_MEDIA_UPLOAD_POSITIVES !== "1";

const isEnterpriseEnvelope = (body: Json): boolean =>
    typeof body.success === "boolean" && typeof body.message === "string";

const multipartRequest = async (
    method: string,
    path: string,
    options: {
        token?: string | null;
        fields?: Record<string, string>;
        files?: Array<{ field: string; filename: string; buffer: Buffer; mime: string }>;
        expectedStatus?: number | number[];
    } = {}
): Promise<{ status: number; body: Json }> => {
    const form = new FormData();

    if (options.fields) {
        for (const [key, value] of Object.entries(options.fields)) {
            form.append(key, value);
        }
    }

    if (options.files) {
        for (const file of options.files) {
            form.append(
                file.field,
                new Blob([new Uint8Array(file.buffer)], { type: file.mime }),
                file.filename
            );
        }
    }

    const headers: Record<string, string> = {};
    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: form,
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

const jsonRequest = async (
    method: string,
    path: string,
    options: {
        token?: string | null;
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

const main = async (): Promise<void> => {
    if (!ACCESS_TOKEN || !PRODUCT_ID) {
        console.error("ACCESS_TOKEN and PRODUCT_ID are required.");
        process.exit(1);
    }

    // Auth negatives
    try {
        await multipartRequest("POST", `/products/${PRODUCT_ID}/media`, {
            token: null,
            files: [
                {
                    field: "images",
                    filename: "a.png",
                    buffer: PNG,
                    mime: "image/png",
                },
            ],
            expectedStatus: 401,
        });
        record("Unauthorized upload without token", true);
    } catch (error) {
        record("Unauthorized upload without token", false, String(error));
    }

    if (CUSTOMER_TOKEN) {
        try {
            await multipartRequest("POST", `/products/${PRODUCT_ID}/media`, {
                token: CUSTOMER_TOKEN,
                files: [
                    {
                        field: "images",
                        filename: "a.png",
                        buffer: PNG,
                        mime: "image/png",
                    },
                ],
                expectedStatus: 403,
            });
            record("Forbidden customer upload", true);
        } catch (error) {
            record("Forbidden customer upload", false, String(error));
        }
    } else {
        record("Forbidden customer upload", true, "skipped (no CUSTOMER_TOKEN)");
    }

    // Empty upload
    try {
        const { body } = await multipartRequest(
            "POST",
            `/products/${PRODUCT_ID}/media`,
            {
                token: ACCESS_TOKEN,
                expectedStatus: [400, 500],
            }
        );
        record(
            "Empty upload rejected",
            body.success === false && isEnterpriseEnvelope(body)
        );
    } catch (error) {
        record("Empty upload rejected", false, String(error));
    }

    // Invalid MIME
    try {
        const { body } = await multipartRequest(
            "POST",
            `/products/${PRODUCT_ID}/media`,
            {
                token: ACCESS_TOKEN,
                files: [
                    {
                        field: "images",
                        filename: "note.txt",
                        buffer: Buffer.from("hello"),
                        mime: "text/plain",
                    },
                ],
                expectedStatus: [400, 500],
            }
        );
        record(
            "Invalid MIME rejected",
            body.success === false && isEnterpriseEnvelope(body)
        );
    } catch (error) {
        record("Invalid MIME rejected", false, String(error));
    }

    // Nonexistent product
    const fakeProductId = "aaaaaaaaaaaaaaaaaaaaaaaa";
    try {
        const { body } = await multipartRequest(
            "POST",
            `/products/${fakeProductId}/media`,
            {
                token: ACCESS_TOKEN,
                files: [
                    {
                        field: "images",
                        filename: "a.png",
                        buffer: PNG,
                        mime: "image/png",
                    },
                ],
                expectedStatus: [404, 400, 500],
            }
        );
        record(
            "Upload nonexistent Product rejected",
            body.success === false && isEnterpriseEnvelope(body)
        );
    } catch (error) {
        record("Upload nonexistent Product rejected", false, String(error));
    }

    // Primary / delete / replace auth negatives
    const fakeMediaId = "bbbbbbbbbbbbbbbbbbbbbbbb";
    try {
        await jsonRequest(
            "PATCH",
            `/products/${PRODUCT_ID}/media/${fakeMediaId}/primary`,
            { token: null, expectedStatus: 401 }
        );
        record("Unauthorized set primary", true);
    } catch (error) {
        record("Unauthorized set primary", false, String(error));
    }

    if (CUSTOMER_TOKEN) {
        try {
            await jsonRequest(
                "PATCH",
                `/products/${PRODUCT_ID}/media/${fakeMediaId}/primary`,
                { token: CUSTOMER_TOKEN, expectedStatus: 403 }
            );
            record("Forbidden set primary", true);
        } catch (error) {
            record("Forbidden set primary", false, String(error));
        }

        try {
            await jsonRequest(
                "DELETE",
                `/products/${PRODUCT_ID}/media/${fakeMediaId}`,
                { token: CUSTOMER_TOKEN, expectedStatus: 403 }
            );
            record("Forbidden delete", true);
        } catch (error) {
            record("Forbidden delete", false, String(error));
        }

        try {
            await multipartRequest(
                "PUT",
                `/products/${PRODUCT_ID}/media/${fakeMediaId}`,
                {
                    token: CUSTOMER_TOKEN,
                    files: [
                        {
                            field: "image",
                            filename: "a.png",
                            buffer: PNG,
                            mime: "image/png",
                        },
                    ],
                    expectedStatus: 403,
                }
            );
            record("Forbidden replace", true);
        } catch (error) {
            record("Forbidden replace", false, String(error));
        }
    }

    try {
        const { body } = await jsonRequest(
            "PATCH",
            `/products/${PRODUCT_ID}/media/${fakeMediaId}/primary`,
            { token: ACCESS_TOKEN, expectedStatus: [404, 400] }
        );
        record(
            "Set primary Media not found",
            body.success === false && isEnterpriseEnvelope(body)
        );
    } catch (error) {
        record("Set primary Media not found", false, String(error));
    }

    try {
        const { body } = await jsonRequest(
            "DELETE",
            `/products/${PRODUCT_ID}/media/${fakeMediaId}`,
            { token: ACCESS_TOKEN, expectedStatus: [404, 400] }
        );
        record(
            "Delete Media not found",
            body.success === false && isEnterpriseEnvelope(body)
        );
    } catch (error) {
        record("Delete Media not found", false, String(error));
    }

    // Product regression — list/details still work
    try {
        const { body } = await jsonRequest("GET", `/products/${PRODUCT_ID}`, {
            token: ACCESS_TOKEN,
            expectedStatus: 200,
        });
        const data = body.data as Json | undefined;
        record(
            "Product details envelope + media field",
            body.success === true &&
                isEnterpriseEnvelope(body) &&
                Array.isArray(data?.media)
        );
    } catch (error) {
        record("Product details envelope + media field", false, String(error));
    }

    try {
        const { body } = await jsonRequest("GET", "/products?limit=5", {
            token: ACCESS_TOKEN,
            expectedStatus: 200,
        });
        record(
            "Product list still works",
            body.success === true && Array.isArray(body.data)
        );
    } catch (error) {
        record("Product list still works", false, String(error));
    }

    if (runPositives) {
        let mediaId = "";
        let mediaId2 = "";

        try {
            const { body } = await multipartRequest(
                "POST",
                `/products/${PRODUCT_ID}/media`,
                {
                    token: ACCESS_TOKEN,
                    files: [
                        {
                            field: "images",
                            filename: "e2e-a.png",
                            buffer: PNG,
                            mime: "image/png",
                        },
                        {
                            field: "images",
                            filename: "e2e-b.png",
                            buffer: PNG,
                            mime: "image/png",
                        },
                    ],
                    expectedStatus: 201,
                }
            );
            const data = body.data as {
                uploaded?: Array<{ id: string; isPrimary: boolean }>;
            };
            mediaId = data?.uploaded?.[0]?.id ?? "";
            mediaId2 = data?.uploaded?.[1]?.id ?? "";
            record(
                "Upload multiple images (Cloudinary)",
                body.success === true &&
                    (data?.uploaded?.length ?? 0) >= 2 &&
                    Boolean(mediaId)
            );
        } catch (error) {
            record("Upload multiple images (Cloudinary)", false, String(error));
        }

        if (mediaId && mediaId2) {
            try {
                const { body } = await jsonRequest(
                    "PATCH",
                    `/products/${PRODUCT_ID}/media/${mediaId2}/primary`,
                    { token: ACCESS_TOKEN, expectedStatus: 200 }
                );
                record(
                    "HTTP set primary",
                    body.success === true && isEnterpriseEnvelope(body)
                );
            } catch (error) {
                record("HTTP set primary", false, String(error));
            }

            try {
                const { body } = await multipartRequest(
                    "PUT",
                    `/products/${PRODUCT_ID}/media/${mediaId}`,
                    {
                        token: ACCESS_TOKEN,
                        files: [
                            {
                                field: "image",
                                filename: "e2e-replaced.png",
                                buffer: PNG,
                                mime: "image/png",
                            },
                        ],
                        expectedStatus: 200,
                    }
                );
                const data = body.data as { id?: string };
                record(
                    "HTTP replace image",
                    body.success === true && data?.id === mediaId
                );
            } catch (error) {
                record("HTTP replace image", false, String(error));
            }

            try {
                const { body } = await jsonRequest(
                    "DELETE",
                    `/products/${PRODUCT_ID}/media/${mediaId}`,
                    { token: ACCESS_TOKEN, expectedStatus: 200 }
                );
                record(
                    "HTTP delete image",
                    body.success === true && isEnterpriseEnvelope(body)
                );
            } catch (error) {
                record("HTTP delete image", false, String(error));
            }

            try {
                await jsonRequest(
                    "DELETE",
                    `/products/${PRODUCT_ID}/media/${mediaId2}`,
                    { token: ACCESS_TOKEN, expectedStatus: 200 }
                );
                record("HTTP cleanup second image", true);
            } catch (error) {
                record("HTTP cleanup second image", false, String(error));
            }
        }
    } else {
        record(
            "Cloudinary positive upload flows",
            true,
            "skipped (configure CLOUDINARY_* or unset SKIP_MEDIA_UPLOAD_POSITIVES)"
        );
    }

    const failed = results.filter((r) => !r.ok);
    console.log("\n--- Media HTTP Smoke Summary ---");
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
        process.exit(1);
    }
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
