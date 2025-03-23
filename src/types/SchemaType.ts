import {ObjectId} from "mongoose";

export interface UserInterface{
    _id: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber: string;
    role: "admin" | "user";
    address: string;
    status: boolean;
    createdAt: Date;
}

export interface TaskInterface{
    _id: ObjectId;
    taskName: string;
    description: string;
    startDate: Date;
    endDate: Date;
    completeDate: Date;
    assignUser: ObjectId;
    status: boolean;
    taskStatus: string;
    createdAt: Date;
}

export interface OtpInterface {
    _id:ObjectId;
    email:string;
    otp:string;
    createdAt?: Date;
    expiredAt: Date;
}