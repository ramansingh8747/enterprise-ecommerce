import { authService, otpService,sessionService } from "../container";
import { Request, Response } from "express";
import { ApiResponse } from "../interfaces/api-response.interface";
import { VerifyOtpRequest } from "../interfaces/verify-otp-request.interface";



export class AuthController {



    async register(
        request: Request,
        response: Response
    ): Promise<void> {


        try {

            const { mobile } = request.body;

            await otpService.createOtp(mobile);

            const apiResponse: ApiResponse<{ mobile: string }> = {
                success: true,
                message: "OTP sent successfully",
                data: {
                    mobile
                }
            };

            response.status(201).json(apiResponse);

        } catch (error) {

            console.error("Register API Error:", error);

            const apiResponse: ApiResponse = {
                success: false,
                message: "Internal Server Error"
            };

            response.status(500).json(apiResponse);
        }


    }

    async verifyOtp(req: Request, res: Response): Promise<void> {



        try {

            const data: VerifyOtpRequest = req.body;

            if (!data.mobile || !data.otp) {
                res.status(400).json({
                    success: false,
                    message: "Mobile and OTP are required."
                });

                return;


            }

            if (!/^\d{10}$/.test(data.mobile)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid mobile number."
                });

                return;
            }

            if (!/^\d{6}$/.test(data.otp.toString())) {
                res.status(400).json({
                    success: false,
                    message: "Invalid OTP."
                });

                return;
            }

            await otpService.verifyOtp(
                data.mobile,
                data.otp
            );

            const result = await authService.verifyOtpAndLogin(
                data.mobile,
                req.ip,
                req.headers["user-agent"]
            );

            res.status(200).json({
                success: true,
                message: "OTP verified successfully.",
                data: result
            });

        } catch (error: any) {

            console.error("❌ Verify OTP Error:", error);

            const message = error.message || "Something went wrong.";

            const statusCode =
                message === "OTP not found." ||
                    message === "OTP has expired." ||
                    message === "Invalid OTP." ||
                    message === "Maximum OTP attempts exceeded."
                    ? 400
                    : 500;

            res.status(statusCode).json({
                success: false,
                message
            });

        }

    }
    async getCurrentUser(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            res.status(200).json({
                success: true,
                message: "Current user fetched successfully.",
                data: req.user
            });

        } catch (error) {

            console.error("❌ Get Current User Error:", error);

            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }

    }

    // 👇 Yahi add karna hai
    async logout(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const userId = req.user!._id.toString();

            await authService.logout(userId);

            res.status(200).json({
                success: true,
                message: "Logged out successfully."
            });

        } catch (error) {

            console.error("❌ Logout Error:", error);

            res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });

        }

    }
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {

            const result = await authService.refreshAccessToken(req.body);

            res.status(200).json({
                success: true,
                message: "Access token refreshed successfully.",
                data: result,
            });


        } catch (error: any) {

            res.status(401).json({
                success: false,
                message: error.message,
            });

        }
    }

    async getSessions(
    req: Request,
    res: Response
): Promise<void> {

    try {

        const userId = req.user!._id.toString();

        const sessions = await sessionService.getSessionsByUserId(userId);

        res.status(200).json({
            success: true,
            message: "Sessions fetched successfully.",
            data: sessions
        });

    } catch (error) {

        console.error("❌ Get Sessions Error:", error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

}

async deleteSession(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!._id.toString();
        const sessionIdParam = req.params.sessionId;
        const sessionId = Array.isArray(sessionIdParam)
            ? sessionIdParam[0]
            : sessionIdParam;

        await sessionService.revokeSessionById(sessionId, userId);

        res.status(200).json({
            success: true,
            message: "Session revoked successfully."
        });

    } catch (error) {
        console.error("❌ Delete Session Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
}
