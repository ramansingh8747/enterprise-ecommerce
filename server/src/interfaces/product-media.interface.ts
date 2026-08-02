/**
 * Product + Media response contracts (Step 13.6).
 *
 * Extends Product reads with populated Media summaries.
 * Legacy `images` / `thumbnail` remain unchanged for backward compatibility.
 */

import { Document, Types } from "mongoose";
import { IProduct } from "./product.interface";
import { IProductMediaSummary } from "../modules/media/interfaces/product-media-summary.interface";

/**
 * Lean Product shape without Mongoose Document methods or media refs.
 */
export type IProductLeanBase = Omit<IProduct, keyof Document | "media"> & {
    _id: Types.ObjectId | string;
};

/**
 * Product API response with selective Media summaries.
 */
export type IProductWithMedia = IProductLeanBase & {
    media: IProductMediaSummary[];
};

/**
 * Lean Product used when casting repository results before attaching media.
 */
export type IProductLean = IProductLeanBase & {
    media?: Types.ObjectId[];
};

export type { IProductMediaSummary };
