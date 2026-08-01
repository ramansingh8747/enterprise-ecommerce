import { Document, Types } from "mongoose";

/**
 * Enterprise Category domain contract.
 *
 * Supports nested categories via self-referencing `parent`.
 */
export interface ICategory extends Document {
    name: string;
    slug: string;
    description: string;

    parent?: Types.ObjectId;
    level: number;

    isActive: boolean;
    sortOrder: number;

    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}
