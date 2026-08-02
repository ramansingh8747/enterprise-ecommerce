import { Types } from "mongoose";
import { ICouponRepository } from "../interfaces/coupon-repository.interface";
import { ICouponDocument } from "../interfaces/coupon.interface";
import Coupon from "../models/coupon.model";

/**
 * Enterprise Coupon Repository.
 * Data-access layer for the Coupon Validation Engine.
 * Database queries only — zero business logic.
 */
export class CouponRepository implements ICouponRepository {
    /**
     * Finds a Coupon document by uppercase sanitized code.
     */
    async findByCode(code: string): Promise<ICouponDocument | null> {
        if (!code?.trim()) {
            return null;
        }
        return Coupon.findOne({ code: code.trim().toUpperCase() }).exec();
    }

    /**
     * Finds a Coupon document by ObjectId string.
     */
    async findById(id: string): Promise<ICouponDocument | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }
        return Coupon.findById(id).exec();
    }
}
