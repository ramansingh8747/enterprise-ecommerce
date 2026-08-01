import jwt from "jsonwebtoken";
import crypto from "crypto";

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
            revoked: false,
        });

        if (!storedToken) {
            throw new Error("Refresh token not found");
        }

        // Find User
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error("User not found");
        }

        // Revoke Old Token
        storedToken.revoked = true;
        await storedToken.save();

        // Generate New Tokens
        const accessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);

        return {
            user,
            accessToken,
            refreshToken: newRefreshToken,
        };
    }

}