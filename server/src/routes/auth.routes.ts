import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

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

export default router;