import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    clubId?: string;
    role: "user" | "admin";
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
            enum: ["user", "admin"],
            default: "user",
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

const User = model<IUser>("User", userSchema);

export default User;