import { v2 as cloudinary } from "cloudinary";

/**
 * Enterprise Cloudinary configuration.
 *
 * Credentials are loaded exclusively from environment variables.
 * Do not hard-code secrets in source control.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;
