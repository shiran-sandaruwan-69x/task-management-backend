import express from "express";
import {AppError} from "../util/AppError";
import {StatusCodes} from "../util/StatusCode";


export const restrictTo = (...roles:string[]) => {
    return (req:express.Request,res:express.Response,next:express.NextFunction) => {

        try {

            //check a user role with permission roles
            if (!roles.includes(req.tokenData.user.role)){
                return next(
                    new AppError(
                        "This user don't have permission to perform this action",
                        403,
                        StatusCodes.UNAUTHORIZED_ACCESS
                    )
                )
            }

            //Access to perform this action
            next();

        }catch (error){
            next(error)
        }
    }
}