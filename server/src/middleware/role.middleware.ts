import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../interfaces/api-response.interface";
import { Role, ROLES, isRole } from "../constants/roles";

/**
 * Role-based authorization middleware.
 *
 * Usage:
 *   router.get("/admin", authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), handler)
 *
 * Must run after `authenticate` so `req.user` is populated.
 */
export const authorize = (...allowedRoles: Role[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        try {
            if (!req.user) {
                const response: ApiResponse = {
                    success: false,
                    message: "Unauthorized",
                };

                res.status(401).json(response);
                return;
            }

            const userRole = req.user.role;

            if (!isRole(userRole) || !allowedRoles.includes(userRole)) {
                const response: ApiResponse = {
                    success: false,
                    message: "Access denied",
                };

                res.status(403).json(response);
                return;
            }

            next();
        } catch (error) {
            console.error("Role Middleware Error:", error);

            const response: ApiResponse = {
                success: false,
                message: "Internal Server Error",
            };

            res.status(500).json(response);
        }
    };
};

export { Role, ROLES };
