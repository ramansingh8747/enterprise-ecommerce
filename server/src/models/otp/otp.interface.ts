import { Document } from "mongoose";

export interface IOtp extends Document {
  mobile: string;
  otp: number;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}