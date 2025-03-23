import mongoose from "mongoose";
import {OtpInterface} from "../types/SchemaType";


const otpSchema = new mongoose.Schema<OtpInterface>({
    email: { type: String, required: true, index: true},
    otp: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
    expiredAt: { type: Date, required: true }
});

// To automatically delete OTP after expiry
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model("otp",otpSchema);
export default OtpModel;