import { ICouponDocument } from "./coupon.interface";

/**
 * Enterprise Coupon Repository Interface.
 * Contains persistence lookup operations required by the validation engine.
 */
export interface ICouponRepository {
    findByCode(code: string): Promise<ICouponDocument | null>;
    findById(id: string): Promise<ICouponDocument | null>;
}
