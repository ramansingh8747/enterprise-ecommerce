import { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";
import { Role, ROLES } from "../constants/roles";

export interface IUser extends Document {
    _id: Types.ObjectId;

    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    clubId?: string;
    role: Role | "user" | "admin";
    isVerified: boolean;
}

const userSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            trim: true,
            default: "",
        },

        lastName: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[6-9]\d{9}$/, "Please enter a valid mobile number"],
        },

        clubId: {
            type: String,
            trim: true,
        },

        role: {
            type: String,
            enum: {
                values: [
                    ...Object.values(ROLES),
                    // Legacy aliases retained for backward compatibility
                    "user",
                    "admin",
                ],
                message: "Invalid user role.",
            },
            default: ROLES.CUSTOMER,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export { User };
export default User;
