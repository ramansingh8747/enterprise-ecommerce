import User from "../models/user.model";
import { JwtService } from "./jwt.service";

export class AuthService {

    constructor(
        private readonly jwtService: JwtService
    ) { }

    async verifyOtpAndLogin(mobile: string) {

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

        console.log("Step 4: Generating JWT");

        const token = this.jwtService.generateToken({
            id: user._id.toString(),
            mobile: user.mobile,
            role: user.role,
        });

        console.log("Step 5: JWT Generated");

        return {
            user,
            token,
        };
    }
}