import jwt from "jsonwebtoken";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { JWT_EXPIRES_IN } from "../constants/jwt.constants";

export class JwtService {

    generateToken(payload: JwtPayload): string {

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not configured.");
        }

        return jwt.sign(
            payload,
            secret,
            {
                expiresIn: JWT_EXPIRES_IN,
            }
        );
    }

}