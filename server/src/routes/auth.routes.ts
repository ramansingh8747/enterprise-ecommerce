import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";


const router = Router();

const authController = new AuthController();


router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth route working"
    });
});

router.post("/register", (req, res) =>
    authController.register(req, res)
);

router.post("/verify-otp", (req, res) =>
    authController.verifyOtp(req, res)
);

router.get(
    "/me",
    authenticate,
    (req, res) => authController.getCurrentUser(req, res)
);

import { authorize } from "../middleware/authorize.middleware";

router.get(
    "/admin",
    authenticate,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin"
        });
    }
);

// ✅ Logout route alag rahega
router.post(
    "/logout",
    authenticate,
    (req, res) => authController.logout(req, res)
);

export default router;