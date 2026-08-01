import jwt from "jsonwebtoken";
import crypto from "crypto";
import os from "os";

import { RefreshToken } from "../../models/refresh-token.model";
import { User } from "../../models/user.model";

import {
    generateAccessToken,
    generateRefreshToken,
} from "../../utils/jwt";

export class RefreshTokenRotationService {

    async rotate(refreshToken: string) {

        // Verify JWT
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!
        ) as { id: string };

        // Hash Token
        const tokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        // Find Token
        const storedToken = await RefreshToken.findOne({
            tokenHash,
        });

        if (!storedToken) {
            throw new Error("Refresh token not found");
        }

        if (storedToken.revoked) {
            await RefreshToken.updateMany(
                {
                    familyId: storedToken.familyId,
                },
                {
                    revoked: true,
                }
            );

            throw new Error("Refresh token reuse detected.All sessions have been revoked.");
        }

        // 👇 यहाँ add करें (ab storedToken defined hai)
        const familyId =
            storedToken.familyId || crypto.randomUUID();

        // Find User
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error("User not found");
        }

        // Revoke Old Token
        storedToken.lastUsedAt = new Date();
        storedToken.revoked = true;
        await storedToken.save();

        // Generate New Tokens
        const accessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);

        // 👇 Add from here
        const newTokenHash = crypto
            .createHash("sha256")
            .update(newRefreshToken)
            .digest("hex");

        await RefreshToken.create({
            userId: user._id,
            tokenHash: newTokenHash,
            familyId,
            deviceInfo: os.hostname(),
            ipAddress: "127.0.0.1",
            expiresAt: new Date(
                Date.now() +
                Number(process.env.JWT_REFRESH_EXPIRES_IN_MS)
            ),
        });
        // 👆 Add till here

        return {
            user,
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

}