import { Schema, model } from "mongoose";
import { IOtp } from "./otp.interface";

const otpSchema = new Schema<IOtp>({

    mobile: {
        type: String,
        required: true,
        trim: true,
    },

    otp: {
        type: Number,
        required: true,
    },

    expiresAt: {
        type: Date,
        required: true,
    },

    attempts: {
        type: Number,
        default: 0,
    },


},

    {
        timestamps: true,
    }

);

otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const Otp = model<IOtp>("Otp", otpSchema);

export default Otp;