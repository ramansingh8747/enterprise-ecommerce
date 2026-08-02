/**
 * Step 15.10 — Order module end-to-end / production readiness runner.
 *
 * Runs existing Order verify scripts + foundation compile checks.
 * Usage: npx ts-node --transpile-only scripts/verify-order-e2e-15-10.ts
 */

import { spawnSync } from "child_process";
import path from "path";
import { PaymentProviderFactory } from "../src/modules/payment/factory/payment-provider.factory";
import { CashfreeProvider } from "../src/modules/payment/providers/cashfree.provider";
import { MockProvider } from "../src/modules/payment/providers/mock.provider";
import { RazorpayProvider } from "../src/modules/payment/providers/razorpay.provider";
import { StripeProvider } from "../src/modules/payment/providers/stripe.provider";
import { NotificationProviderFactory } from "../src/modules/notification/factory/notification-provider.factory";
import { EmailNotificationProvider } from "../src/modules/notification/providers/email.provider";
import { MockNotificationProvider } from "../src/modules/notification/providers/mock.provider";
import { PushNotificationProvider } from "../src/modules/notification/providers/push.provider";
import { SmsNotificationProvider } from "../src/modules/notification/providers/sms.provider";

const root = path.resolve(__dirname, "..");

type StepResult = { name: string; ok: boolean; detail: string };

const results: StepResult[] = [];

const runNodeScript = (label: string, scriptRel: string): void => {
    const script = path.join(root, scriptRel);
    const r = spawnSync(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["ts-node", "--transpile-only", script],
        {
            cwd: root,
            encoding: "utf8",
            shell: true,
            env: process.env,
        }
    );
    const ok = r.status === 0;
    results.push({
        name: label,
        ok,
        detail: ok
            ? "PASS"
            : `${r.stdout || ""}${r.stderr || ""}` || `exit ${r.status}`,
    });
    console.log(`\n=== ${label}: ${ok ? "PASS" : "FAIL"} ===`);
    if (r.stdout) console.log(r.stdout);
    if (!ok && r.stderr) console.error(r.stderr);
};

const runFoundationChecks = (): void => {
    try {
        const payment = PaymentProviderFactory.create("mock");
        if (typeof payment.createPayment !== "function") {
            throw new Error("Payment mock provider missing createPayment");
        }

        const paymentCtors = [
            MockProvider,
            RazorpayProvider,
            StripeProvider,
            CashfreeProvider,
        ];
        for (const Ctor of paymentCtors) {
            const inst = new Ctor();
            if (
                typeof inst.createPayment !== "function" ||
                typeof inst.verifyPayment !== "function" ||
                typeof inst.cancelPayment !== "function" ||
                typeof inst.refundPayment !== "function"
            ) {
                throw new Error(`${Ctor.name} missing IPaymentProvider methods`);
            }
        }

        let threw = false;
        try {
            // Placeholders must not deliver — expect Not Implemented
            void payment.createPayment({
                orderId: "x",
                amount: 1,
            });
        } catch {
            threw = true;
        }
        // createPayment returns a Promise that rejects — check async
        void threw;

        const notif = NotificationProviderFactory.create("mock");
        if (typeof notif.send !== "function") {
            throw new Error("Notification mock provider missing send");
        }

        const notifCtors = [
            MockNotificationProvider,
            EmailNotificationProvider,
            SmsNotificationProvider,
            PushNotificationProvider,
        ];
        for (const Ctor of notifCtors) {
            const inst = new Ctor();
            if (
                typeof inst.send !== "function" ||
                typeof inst.sendEmail !== "function" ||
                typeof inst.sendSMS !== "function" ||
                typeof inst.sendPush !== "function"
            ) {
                throw new Error(
                    `${Ctor.name} missing INotificationProvider methods`
                );
            }
        }

        results.push({
            name: "Payment + Notification foundations",
            ok: true,
            detail: "Factories + providers implement contracts (no delivery)",
        });
        console.log("\n=== Payment + Notification foundations: PASS ===");
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        results.push({
            name: "Payment + Notification foundations",
            ok: false,
            detail: msg,
        });
        console.log("\n=== Payment + Notification foundations: FAIL ===");
        console.error(msg);
    }
};

const main = async (): Promise<void> => {
    console.log("Module 15 – Step 15.10 E2E runner\n");

    // Confirm placeholders reject (no delivery / no gateway logic)
    try {
        await PaymentProviderFactory.create("mock").createPayment({
            orderId: "x",
            amount: 1,
        });
        throw new Error("Payment provider unexpectedly succeeded");
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (!msg.includes("Not Implemented")) {
            results.push({
                name: "Payment placeholder throws Not Implemented",
                ok: false,
                detail: msg,
            });
        } else {
            results.push({
                name: "Payment placeholder throws Not Implemented",
                ok: true,
                detail: msg,
            });
            console.log("=== Payment placeholder throws Not Implemented: PASS ===");
        }
    }

    try {
        await NotificationProviderFactory.create("mock").send({});
        throw new Error("Notification provider unexpectedly succeeded");
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (!msg.includes("Not Implemented")) {
            results.push({
                name: "Notification placeholder throws Not Implemented",
                ok: false,
                detail: msg,
            });
        } else {
            results.push({
                name: "Notification placeholder throws Not Implemented",
                ok: true,
                detail: msg,
            });
            console.log(
                "=== Notification placeholder throws Not Implemented: PASS ==="
            );
        }
    }

    runFoundationChecks();
    runNodeScript("Order Creation (15.4)", "scripts/verify-order-create.ts");
    runNodeScript("Order Status (15.5)", "scripts/verify-order-status.ts");
    runNodeScript("Order APIs / RBAC (15.7)", "scripts/verify-order-apis.ts");
    runNodeScript("Order Reports (15.8)", "scripts/verify-order-reports.ts");

    const failed = results.filter((r) => !r.ok);
    console.log("\n----------------------------------------");
    for (const r of results) {
        console.log(`[${r.ok ? "PASS" : "FAIL"}] ${r.name}`);
    }
    console.log(
        `\nStep 15.10 suite: ${results.length - failed.length}/${results.length} passed`
    );
    process.exit(failed.length ? 1 : 0);
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
