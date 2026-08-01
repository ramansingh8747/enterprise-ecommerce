import jwt, { SignOptions } from "jsonwebtoken";
import {
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
} from "../constants/jwt.constants";

/**
 * Minimal user shape accepted by legacy JWT helper callers.
 */
type JwtUserLike = {
    _id: { toString(): string };
    mobile: string;
    role: string;
};

/**
 * Builds the JWT payload used across auth helpers.
 */
const toPayload = (user: JwtUserLike) => {
    const id = user._id.toString();

    return {
        id,
        userId: id,
        mobile: user.mobile,
        role: user.role,
    };
};

/**
 * Legacy helper expected by older auth modules.
 * Thin wrapper around jsonwebtoken (does not alter JwtService).
 */
export const generateAccessToken = (user: JwtUserLike): string => {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error("JWT_ACCESS_SECRET is not configured.");
    }

    return jwt.sign(toPayload(user), secret, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
};

/**
 * Legacy helper expected by older auth modules.
 * Thin wrapper around jsonwebtoken (does not alter JwtService).
 */
export const generateRefreshToken = (user: JwtUserLike): string => {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not configured.");
    }

    return jwt.sign(toPayload(user), secret, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
};
