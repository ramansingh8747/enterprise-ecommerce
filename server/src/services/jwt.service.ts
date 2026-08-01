import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

import {
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
} from "../constants/jwt.constants";

export class JwtService {

    public generateAccessToken(payload: JwtPayload): string {

        const secret = process.env.JWT_ACCESS_SECRET;

        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET is not configured.");
        }

        return jwt.sign(payload, secret, {
            expiresIn: JWT_ACCESS_EXPIRES_IN,
        } as SignOptions);
    }

    public generateRefreshToken(payload: JwtPayload): string {

        const secret = process.env.JWT_REFRESH_SECRET;

        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET is not configured.");
        }

        return jwt.sign(payload, secret, {
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        } as SignOptions);
    }

    public verifyAccessToken(token: string): JwtPayload {

        const secret = process.env.JWT_ACCESS_SECRET;

        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET is not configured.");
        }

        return jwt.verify(token, secret) as JwtPayload;
    }

    public verifyRefreshToken(token: string): JwtPayload {

        const secret = process.env.JWT_REFRESH_SECRET;

        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET is not configured.");
        }

        return jwt.verify(token, secret) as JwtPayload;
    }
}
