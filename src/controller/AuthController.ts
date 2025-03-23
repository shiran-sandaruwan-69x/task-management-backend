import express from "express";
import {AppError} from "../util/AppError";
import {StatusCodes} from "../util/StatusCode";
import UserModel from "../model/UserModel";
import bcrypt from "bcryptjs"
import {CustomResponse} from "../util/CustomResponse";
import generateAccessToken from "../util/TokenGenerator";
import {UserDTO} from "../dto/UserDTO";
import otpGenerator from 'otp-generator'
import OtpModel from "../model/OtpModel";
import mongoose from "mongoose";
import {sendEmail} from "../util/EmailService";
import {EmailOptions} from "../dto/EmailOptions";

export const loginUser = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { email, password } = req.body;

        if (!email || !password){
            throw new AppError(
                "Email or Password missing! Please try again later!",
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Find the user by email
        const user = await UserModel.findOne({ email }).lean();

        if (!user){
            throw new AppError(
                'User not found!',
                404,
                StatusCodes.USER_NOT_FOUND
            )
        }

        // validate password
        if (!await bcrypt.compare(password,user.password)){
            throw new AppError(
                'Invalid password! Please try again later.',
                401,
                StatusCodes.INVALID_PASSWORD)
        }

        //remove password
        user.password='';

        const token = await generateAccessToken(
            new UserDTO(
                user.firstName,
                user.lastName,
                user.email,
                '',
                user.mobileNumber,
                user.role,
                user.address,
                user.status,
                user.createdAt
            )
        )

        res.status(200).send(
            new CustomResponse(
                StatusCodes.USER_UPDATE_SUCCESSFULLY,
                'User login successfully!',
                {
                    user:user,
                    token:token
                }
            )
        )

    } catch (e) {
        next(e)
    }

}


export const newPassword = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { email, password } = req.body;

        if (!email || !password){
            throw new AppError(
                "Email or Password missing! Please try again later!",
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        // Find the user by email
        const user = await UserModel.findOne({ email });

        if (!user){
            throw new AppError(
                'User not found!',
                404,
                StatusCodes.USER_NOT_FOUND
            )
        }

        user.password = hashedPassword;

        // Save updated details in db
        await user.save();

        user.password='';

        res.status(200).send(
            new CustomResponse(
                StatusCodes.USER_UPDATE_SUCCESSFULLY,
                "Profile updated successfully",
                user
            )
        );

    } catch (error){
        next(error)
    }

}

export const sendOtp = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    // Create session
    const session = await mongoose.startSession();
    // Start transaction
    session.startTransaction();

    try {

        const email = req.query.email as string;

        if (!email){
            throw new AppError(
                "Email is missing! Please try again later!",
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // 30 seconds in milliseconds
        const expiryTime = 60 * 1000;
        const expiryDate = new Date(Date.now() + expiryTime);

        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets:false
        });

        // hash otp
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp,salt);

        const newUser = await OtpModel.create(
            [
                {
                    email: email,
                    otp: hashedOtp,
                    expiredAt: expiryDate
                }
            ],
            {session}
        );

        await sendEmail(new EmailOptions(
            email,
            "OTP Code",
            `Your otp number is ${otp}`
        ))

        await session.commitTransaction();

        res.status(200).send(
            new CustomResponse(
                StatusCodes.OTP_SEND_SUCCESSFULLY,
                "Otp send successfully."
            )
        )


    }catch (error){
        await session.abortTransaction()
        next(error)
    } finally {
        await session.endSession()
    }

}

export const verifyOtp = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp){
            throw new AppError(
                'Email or Otp is missing!',
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // check in db
        const otpByEmail =
            await OtpModel.findOne({email:email}).sort({createdAt: -1}).limit(1).lean();

        if (!otpByEmail){
            throw new AppError(
                'OTP has expired. Please request a new one.',
                410,
                StatusCodes.OTP_VERIFICATION_FAIL
            )
        }

        // verify otp
        if (!await bcrypt.compare(otp,otpByEmail.otp)){
            throw new AppError(
                'Invalid otp! Please try again later.',
                401,
                StatusCodes.OTP_VERIFICATION_FAIL)
        }

        //delete otp after verify successfully
        await OtpModel.deleteMany({email:email});

        res.status(200).send(
            new CustomResponse(
                StatusCodes.OTP_VERIFICATION_SUCCESSFULLY,
                "OTP verification success.",
                true
            )
        )

    } catch (error){
        next(error)
    }

}