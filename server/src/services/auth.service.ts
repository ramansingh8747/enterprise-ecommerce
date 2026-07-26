import User from "../models/user.model";
import { JwtService } from "./jwt.service";
import { SessionService } from "./session.service";
import { RefreshTokenRequest } from "../interfaces/refresh-token-request.interface";
import { RefreshTokenResponse } from "../interfaces/refresh-token-response.interface";

export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService
    ) { }

    async verifyOtpAndLogin(
        mobile: string,
        ipAddress?: string,
        userAgent?: string
    ) {

        console.log("Step 1: Finding user");

        let user = await User.findOne({ mobile });

        console.log("User Found:", user);

        if (!user) {

            console.log("Step 2: Creating user");

            user = await User.create({
                mobile,
                isVerified: true,
            });

            console.log("User Created:", user);

        } else {

            console.log("Step 3: Updating user");

            user.isVerified = true;
            await user.save();

        }

        console.log("Step 4: Generating Tokens");

        const payload = {
            id: user._id.toString(),
            mobile: user.mobile,
            role: user.role,
        };

        const accessToken = this.jwtService.generateAccessToken(payload);
        const refreshToken = this.jwtService.generateRefreshToken(payload);

        console.log("Step 5: Tokens Generated");

        // ✅ Session create
        await this.sessionService.createSession(
            user._id.toString(),
            refreshToken,
            undefined,
            ipAddress,
            userAgent
        );

        return {
            user,
            accessToken,
            refreshToken,
        };

    }

    async refreshAccessToken(
        data: RefreshTokenRequest
    ): Promise<RefreshTokenResponse> {

        console.log("Refresh Token:", data.refreshToken);

        // Step 1: Verify Refresh Token
        const payload = this.jwtService.verifyRefreshToken(
            data.refreshToken
        );

        console.log("Payload:", payload);

        // Step 2: Find Active Session
        const session = await this.sessionService.findSessionByRefreshToken(
            data.refreshToken
        );
        console.log("Session:", session);

        if (!session) {
            throw new Error("Invalid or expired session.");
        }

        // Step 3: Generate New Access Token
        const accessToken = this.jwtService.generateAccessToken({
            id: payload.id,
            mobile: payload.mobile,
            role: payload.role,
        });

        // Step 4: Return Access Token
        return {
            accessToken,
        };
    }
}