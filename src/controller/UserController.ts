import express from "express";
import {AppError} from "../util/AppError";
import {StatusCodes} from "../util/StatusCode";
import UserModel from "../model/UserModel";
import mongoose from "mongoose";
import {CustomResponse} from "../util/CustomResponse";
import bcrypt from "bcryptjs"
import {sendEmail} from "../util/EmailService";
import {EmailOptions} from "../dto/EmailOptions";

export const saveNewUser = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    const { firstName, lastName, email, mobileNumber, role, address, status, password } = req.body;

    // Create session
    const session = await mongoose.startSession();
    // Start transaction
    session.startTransaction();

    try {

        // Validate req body details
        if (!firstName || !lastName || !role || !address || !email || !mobileNumber){
            throw new AppError(
                'Something is missing! Please check and try again.',
                400,
                StatusCodes.DATA_NOT_FOUND)
        }

        // Check user exists
        const user =
            await UserModel.findOne(
                {$or: [{ email: email }, { mobileNumber: mobileNumber }]},undefined, undefined).select('-password');

        if (user){
            throw new AppError(
                'Email or Mobile number already used!',
                409,
                StatusCodes.DUPLICATE_ENTRY);
        }

        //save user in db
        const newUser = await UserModel.create(
            [
                {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password:'',
                    mobileNumber: mobileNumber,
                    role: role,
                    address: address,
                    status: status
                }
            ],
            {session}
        );

        await sendEmail(new EmailOptions(
            email,
            'Change Your password',
            `Go to this link to change your password >>> http://localhost:3001/auth/forgot-password`
        ))

        await session.commitTransaction();

        //send response
        res.status(201).send(
            new CustomResponse(
                StatusCodes.USER_REGISTRATION_SUCCESS,
                'User registered successfully.',
                newUser[0]
            )
        )

    }catch (error){
        await session.abortTransaction()
        next(error)
    } finally {
        await session.endSession()
    }

}

export const deleteUser = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const id = req.query.id as string;

        // Validate details
        if (!id){
            throw new AppError(
                'Email is missing! Please check and try again.',
                400,
                StatusCodes.DATA_NOT_FOUND)
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(
                'User ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Find and delete user
        const deletedUser = await UserModel.findOneAndDelete({ _id:id });

        if (!deletedUser) {
            throw new AppError(
                'User not found',
                404,
                StatusCodes.USER_NOT_FOUND
            )
        }

        // Send response
        res.status(200).json(
            new CustomResponse(
                StatusCodes.USER_DELETE_SUCCESSFULLY,
                "User deleted successfully.",
                {
                    deletedUser:deletedUser
                }
            )
        );

    }catch (error){
        next(error)
    }

}

export const getAllUsers = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { page, limit, firstName, lastName, email, role, status, address } = req.query;

        // Pagination defaults
        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Create dynamic filters ----------------------------
        let filters: any = {};

        // Case-insensitive search
        if (firstName && firstName !== 'null') filters.firstName = { $regex: firstName, $options: "i" };
        if (lastName && lastName !== 'null') filters.lastName = { $regex: lastName, $options: "i" };
        if (email  && email !== 'null') filters.email = { $regex: email, $options: "i" };
        if (address  && address !== 'null') filters.address = { $regex: address, $options: "i" };
        if (role  && role !== 'null') filters.role = role;
        if ( status === 'true' || status === 'false' ) filters.status = status === "true";


        // -----------------------------------------------------

        // Get total users count
        const totalRecodes = await UserModel.countDocuments(filters);
        // Total pages
        const totalPages = Math.ceil(totalRecodes / limitNumber)

        // Get user recodes - as a JSON objects
        const users =
            await UserModel.find(filters).skip(skip).limit(limitNumber).select("-password").sort({ createdAt: -1 }).lean();

        res.status(200).send(
            new CustomResponse(
                StatusCodes.DATA_FOUND_SUCCESSFULLY,
                "Users found successfully.",
                users,
                totalPages,
                totalRecodes,
                pageNumber
            )
        )

    }catch (error){
        next(error)
    }

}

export const updateUser = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { userId, email, firstName, lastName, mobileNumber, address, status, role } = req.body;

        if (!userId) {
            throw new AppError(
                "Email is required for updating profile",
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError(
                'User ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Find the user by email
        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            throw new AppError(
                'User not found!',
                404,
                StatusCodes.USER_NOT_FOUND
            )
        }

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (mobileNumber) user.mobileNumber = mobileNumber;
        if (address) user.address = address;
        if (status!==null && status!==undefined) user.status = status;
        if (email) user.email = email;
        if (role) user.role = role;

        // Save updated details in db
        await user.save();

        res.status(200).send(
            new CustomResponse(
                StatusCodes.USER_UPDATE_SUCCESSFULLY,
                "Profile updated successfully",
                user
            )
        );

    }catch (error) {
        next(error)
    }

}

export const getAllUsersDetails = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {


        const users = await UserModel.find({role:"user", status: true})
            .select("_id email firstName lastName")
            .sort({ createdAt: -1 });

        res.status(200).send(
            new CustomResponse(
                StatusCodes.DATA_FOUND_SUCCESSFULLY,
                "Get all users",
                users
            )
        )

    }catch (error){
        next(error)
    }

}