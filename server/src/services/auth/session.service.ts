import { RefreshToken } from "../../models/refresh-token.model";

export class SessionService {

    async getUserSessions(userId: string) {

        const sessions = await RefreshToken.find({
            userId,
            revoked: false,
        })
            .select(
                "deviceInfo ipAddress lastUsedAt expiresAt familyId"
            )
            .sort({
                lastUsedAt: -1,
            });


        return sessions;
    }

    async revokeSession(userId: string, sessionId: string) {

        const session = await RefreshToken.findOne({
            _id: sessionId,
            userId,
            revoked: false,
        });

        if (!session) {
            throw new Error("Session not found");
        }

        session.revoked = true;
        await session.save();

        return session;
    }

}