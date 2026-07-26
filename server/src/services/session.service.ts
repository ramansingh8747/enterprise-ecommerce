import Session from "../models/session.model";

export class SessionService {

    async createSession(
    userId: string,
    refreshToken: string,
    device?: string,
    ipAddress?: string,
    userAgent?: string
)
{

    const expiresAt = new Date();

    // Refresh Token expires after 7 days
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await Session.create({
        userId,
        refreshToken,
        device,
        ipAddress,
        userAgent,
        expiresAt
    });

    }
     async findSessionByRefreshToken(refreshToken: string) {
        return Session.findOne({
            refreshToken,
            isRevoked: false,
        });
    }

}

