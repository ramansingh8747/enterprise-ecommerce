import { Router } from "express";

import { sessionController } from "../../controllers/auth/session.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
    "/sessions",
    authenticate,
    sessionController.getSessions
);

router.delete(
    "/sessions/:sessionId",
    authenticate,
    sessionController.revokeSession
);

export default router;