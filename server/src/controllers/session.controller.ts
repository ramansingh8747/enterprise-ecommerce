import { Request, Response, NextFunction } from "express";

import { SessionService } from "../services/auth/session.service";

const sessionService = new SessionService();

export class SessionController {
    async getSessions(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const userId = req.user._id.toString();

            const sessions =
                await sessionService.getUserSessions(userId);

            return res.status(200).json({
                success: true,
                message: "Sessions fetched successfully",
                data: sessions,
            });
        } catch (error) {
            next(error);
        }
    }

    // 👇 यह method यहीं add करें
    async revokeSession(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const userId = req.user._id.toString();
            const sessionIdParam = req.params.sessionId;
            const sessionId = Array.isArray(sessionIdParam)
                ? sessionIdParam[0]
                : sessionIdParam;

            await sessionService.revokeSession(userId, sessionId);

            return res.status(200).json({
                success: true,
                message: "Session revoked successfully",
            });
        } catch (error) {
            next(error);
        }
    }
}

export const sessionController = new SessionController();