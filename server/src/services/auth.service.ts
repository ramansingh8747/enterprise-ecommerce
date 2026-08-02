import User from "../models/user.model";
import { JwtService } from "./jwt.service";
import { SessionService } from "./session.service";
import { RefreshTokenRequest } from "../interfaces/refresh-token-request.interface";
import { RefreshTokenResponse } from "../interfaces/refresh-token-response.interface";
import { IEmailService } from "../modules/email/interfaces/email-service.interface";
import { ITemplateRenderer } from "../modules/email/templates/interfaces/template-renderer.interface";
import { EmailCategory, EmailPriority, EmailTemplateId } from "../modules/email/types/email.types";
import { IEmailRequest } from "../modules/email/interfaces/email-request.interface";

export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService,
        private readonly emailService?: IEmailService,
        private readonly templateRenderer?: ITemplateRenderer
    ) { }

    public async logout(userId: string): Promise<void> {
        await this.sessionService.revokeSessionsByUserId(userId);
    }

    /**
     * Non-blocking Welcome Email Dispatcher (Module 20.7).
     * Renders WelcomeEmailTemplate and dispatches via IEmailService without blocking user registration.
     */
    public async sendWelcomeEmail(user: { email?: string; firstName?: string; lastName?: string }): Promise<void> {
        if (!this.emailService || !this.templateRenderer || !user.email) {
            return;
        }

        try {
            const rendered = await this.templateRenderer.render(EmailTemplateId.WELCOME, {
                firstName: user.firstName || 'Customer',
                lastName: user.lastName || '',
                applicationName: 'Enterprise Store',
                loginUrl: 'https://enterprisestore.com/login',
                supportEmail: 'support@enterprisestore.com',
            });

            const emailRequest: IEmailRequest = {
                to: user.email,
                subject: rendered.subject,
                html: rendered.html,
                text: rendered.text,
                category: EmailCategory.AUTH,
                priority: EmailPriority.HIGH,
            };

            const response = await this.emailService.sendEmail(emailRequest);
            console.log('[AuthService] Welcome email dispatch result:', response);
        } catch (error: any) {
            console.error('❌ [AuthService] Non-blocking welcome email error:', error.message || error);
        }
    }

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

            // Non-blocking Welcome Email dispatch on user creation
            this.sendWelcomeEmail(user).catch((err) => {
                console.error("❌ Non-blocking welcome email delivery failure:", err.message || err);
            });
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