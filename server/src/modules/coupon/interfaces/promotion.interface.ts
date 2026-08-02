/**
 * Supported Promotion strategy types for future engine extensions.
 */
export enum PromotionType {
    AUTOMATIC = "AUTOMATIC",
    FLASH_SALE = "FLASH_SALE",
    FESTIVAL = "FESTIVAL",
    BUY_X_GET_Y = "BUY_X_GET_Y",
    LOYALTY = "LOYALTY",
    REFERRAL = "REFERRAL",
    FIRST_ORDER = "FIRST_ORDER",
    SHIPPING = "SHIPPING",
    SCHEDULED = "SCHEDULED",
    STACKABLE = "STACKABLE",
}

/**
 * Supported Promotion target scopes.
 */
export enum PromotionTarget {
    ORDER_SUBTOTAL = "ORDER_SUBTOTAL",
    SPECIFIC_PRODUCT = "SPECIFIC_PRODUCT",
    SPECIFIC_CATEGORY = "SPECIFIC_CATEGORY",
    SHIPPING = "SHIPPING",
    ITEM_BUNDLE = "ITEM_BUNDLE",
}

/**
 * Item contract for promotional scope checking.
 */
export interface IPromotionItem {
    productId: string;
    categoryId?: string;
    brandId?: string;
    price: number;
    quantity: number;
}

/**
 * Context payload passed into the Promotion Engine for evaluation.
 */
export interface IPromotionContext {
    orderAmount: number;
    items?: IPromotionItem[];
    customerId?: string;
    isFirstOrder?: boolean;
    couponCode?: string;
    currentDate?: Date;
}

/**
 * Extensible rule contract for Promotion Engine evaluation.
 */
export interface IPromotionRule {
    id: string;
    name: string;
    type: PromotionType;
    target: PromotionTarget;
    priority: number;
    isStackable: boolean;
    isApplicable(context: IPromotionContext): Promise<boolean> | boolean;
}

/**
 * Evaluation output contract returned by Promotion Engine foundation.
 */
export interface IPromotionEvaluationResult {
    eligiblePromotions: IPromotionRule[];
    isStackableApplied: boolean;
    totalEligibleCount: number;
    message: string;
}

/**
 * Enterprise Promotion Service Interface.
 */
export interface IPromotionService {
    registerRule(rule: IPromotionRule): void;
    getRegisteredRules(): IPromotionRule[];
    evaluatePromotions(context: IPromotionContext): Promise<IPromotionEvaluationResult>;
}
