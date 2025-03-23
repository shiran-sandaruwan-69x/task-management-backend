import express from "express";
import {AppError} from "../util/AppError";
import {StatusCodes} from "../util/StatusCode";
import process from "process";
import jwt, {Secret} from "jsonwebtoken";
import {JWT_SECRET} from "../config/env";
import UserModel from "../model/UserModel";
// import {findUserById} from "../service/UserService";

export const authorize = async (req:express.Request, res:express.Response, next:express.NextFunction) => {

    try {

        // [Bearer <token>]
        //that's why authorizationToken split from ''(space)
        //then we can get jwt token
        let token: string | null = null;

        //1) Extract token from authorization header

        if (req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)){
            token = req.headers.authorization.split(" ")[1];
        }

        // Sent error msg if token not found in headers
        if (!token){
            return next(
                new AppError(
                    "Token not found!",
                    401,
                    StatusCodes.TOKEN_NOT_FOUND)
            );
        }

        const decode:any = jwt.verify(token, JWT_SECRET as Secret);

        //find  user is exists in db
        if (!await UserModel.findOne({email:decode.user.email}).select('-password').lean()){
            throw new AppError(
                'User not found! Unauthorized access!',
                401,
                StatusCodes.USER_NOT_FOUND)
        }

        // Set decode data ro req
        req.tokenData = decode;

        //GRANT ACCESS TO PROTECTED ROUTE
        next();

    } catch (error) {
        next(error)
    }

}