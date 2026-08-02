/**
 * Media Module — offline validator E2E checks (Step 13.10).
 *
 * No HTTP server or Cloudinary required.
 *
 * Usage:
 *   npx ts-node --transpile-only scripts/e2e-media.validators.ts
 */

import {
    validateExtension,
} from "../src/modules/media/validators/extension.validator";
import { validateFileSize } from "../src/modules/media/validators/file-size.validator";
import { validateFilename } from "../src/modules/media/validators/filename.validator";
import { validateMimeType } from "../src/modules/media/validators/mime.validator";
import {
    assertValidUploadFile,
    validateUploadCount,
    validateUploadFiles,
} from "../src/modules/media/validators/upload.validator";
import {
    MEDIA_MAX_IMAGE_SIZE_BYTES,
    MEDIA_UPLOAD_LIMITS,
} from "../src/modules/media/media.upload-limits";
import { MediaValidationError } from "../src/modules/media/interfaces/media-validation-result.interface";

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

const pngFile = {
    buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
    ),
    mimetype: "image/png",
    originalname: "sample.png",
    size: 68,
};

const main = (): void => {
    record(
        "MIME accepts image/png",
        validateMimeType("image/png").success === true
    );
    record(
        "MIME rejects application/pdf",
        validateMimeType("application/pdf").success === false
    );
    record(
        "MIME rejects video/mp4",
        validateMimeType("video/mp4").success === false
    );
    record(
        "Extension accepts .webp",
        validateExtension("hero.webp").success === true
    );
    record(
        "Extension rejects .exe",
        validateExtension("malware.exe").success === false
    );
    record(
        "Filename rejects empty",
        validateFilename("").success === false
    );
    record(
        "Filename rejects path characters",
        validateFilename("a/b.png").normalizedFilename === "b.png" ||
            validateFilename("a/b.png").success === true
    );
    record(
        "File size rejects empty",
        validateFileSize(0).success === false
    );
    record(
        "File size rejects oversized",
        validateFileSize(MEDIA_MAX_IMAGE_SIZE_BYTES + 1).success === false
    );
    record(
        "File size accepts within limit",
        validateFileSize(1024).success === true
    );
    record(
        "Upload count rejects zero",
        validateUploadCount(0).success === false
    );
    record(
        "Upload count rejects over MAX_PRODUCT_IMAGES",
        validateUploadCount(MEDIA_UPLOAD_LIMITS.MAX_PRODUCT_IMAGES + 1)
            .success === false
    );
    record(
        "Upload count respects existingCount cap",
        validateUploadCount(2, {
            existingCount: MEDIA_UPLOAD_LIMITS.MAX_PRODUCT_IMAGES - 1,
            maxFiles: MEDIA_UPLOAD_LIMITS.MAX_PRODUCT_IMAGES,
        }).success === false
    );
    record(
        "assertValidUploadFile accepts valid PNG",
        (() => {
            try {
                assertValidUploadFile(pngFile);
                return true;
            } catch {
                return false;
            }
        })()
    );
    record(
        "assertValidUploadFile rejects text/plain",
        (() => {
            try {
                assertValidUploadFile({
                    ...pngFile,
                    mimetype: "text/plain",
                    originalname: "note.txt",
                });
                return false;
            } catch (error) {
                return error instanceof MediaValidationError;
            }
        })()
    );
    record(
        "validateUploadFiles rejects empty array",
        validateUploadFiles([]).success === false
    );

    const failed = results.filter((r) => !r.ok);
    console.log("\n--- Media Validator E2E Summary ---");
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
        process.exitCode = 1;
    }
};

main();
