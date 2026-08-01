import { Router } from "express";

import { sessionController } from "../../controllers/session.controller";
import { authenticate } from "../../middleware/auth.middleware";

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
