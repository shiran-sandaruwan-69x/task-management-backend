import express from "express";
import {loginUser, newPassword, sendOtp, verifyOtp} from "../controller/AuthController";

const router = express.Router();

router.post('/login', loginUser)

router.put('/reset-password', newPassword)

router.get('/otp/req', sendOtp)

router.post('/otp/verify', verifyOtp)

export default router;