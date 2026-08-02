import {
    IPromotionContext,
    IPromotionEvaluationResult,
    IPromotionRule,
    IPromotionService,
} from "../interfaces/promotion.interface";

/**
 * Enterprise Promotion Engine Foundation Service.
 *
 * Orchestrates rule registration and applicability evaluation.
 * Independent from Order, Payment, and Inventory modules.
 * Does NOT perform database queries, discount calculations, or order updates.
 */
export class PromotionService implements IPromotionService {
    private readonly rules: IPromotionRule[] = [];

    /**
     * Registers a new promotion rule into the engine.
     * Keeps registered rules sorted by priority (descending).
     */
    registerRule(rule: IPromotionRule): void {
        if (!rule || !rule.id || !rule.name) {
            throw new Error("Invalid promotion rule contract.");
        }

        const existingIndex = this.rules.findIndex((r) => r.id === rule.id);
        if (existingIndex !== -1) {
            this.rules[existingIndex] = rule;
        } else {
            this.rules.push(rule);
        }

        // Sort descending by priority (higher numerical value = higher priority)
        this.rules.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Returns a copy of currently registered promotion rules.
     */
    getRegisteredRules(): IPromotionRule[] {
        return [...this.rules];
    }

    /**
     * Evaluates registered promotion rules against the provided context.
     *
     * @param context Inbound evaluation context (order amount, items, customer, etc.)
     * @returns IPromotionEvaluationResult containing eligible rules
     */
    async evaluatePromotions(
        context: IPromotionContext
    ): Promise<IPromotionEvaluationResult> {
        if (!context || typeof context.orderAmount !== "number" || context.orderAmount < 0) {
            throw new Error("Order amount must be a non-negative number.");
        }

        const eligible: IPromotionRule[] = [];
        let isStackableApplied = false;

        for (const rule of this.rules) {
            try {
                const isApplicable = await rule.isApplicable(context);
                if (isApplicable) {
                    // Non-stackable primary rule halts further stackable accumulation
                    if (!rule.isStackable && eligible.length > 0) {
                        continue;
                    }

                    eligible.push(rule);

                    if (!rule.isStackable) {
                        // First non-stackable rule takes precedence; stop further evaluation
                        break;
                    }

                    isStackableApplied = true;
                }
            } catch {
                // Rule evaluation safety fallback — log/continue next rule
                continue;
            }
        }

        return {
            eligiblePromotions: eligible,
            isStackableApplied: eligible.length > 1 || (eligible.length === 1 && eligible[0].isStackable),
            totalEligibleCount: eligible.length,
            message:
                eligible.length > 0
                    ? `Successfully evaluated ${eligible.length} eligible promotion(s).`
                    : "No eligible promotions found for the provided context.",
        };
    }
}
