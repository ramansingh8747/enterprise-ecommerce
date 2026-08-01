import { Request, Response, NextFunction } from "express";
import { jwtService } from "../container";
import User from "../models/user.model";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const authHeader = req.headers.authorization;

        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwtService.verifyAccessToken(token);

        const user = await User.findById(decoded.id).select("-__v");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Normalize legacy role aliases for enterprise RBAC middleware.
        if (user.role === "admin") {
            user.role = "ADMIN" as typeof user.role;
        } else if (user.role === "user") {
            user.role = "CUSTOMER" as typeof user.role;
        }

        req.user = user;

        next();

    } catch (error) {

        console.error("Authenticate Middleware Error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};