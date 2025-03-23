import {ObjectId} from "mongoose";

export interface UserDtoInterface{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobileNumber: string;
    role: "admin" | "user";
    address: string;
    status: boolean;
    createdAt: Date
}

export interface TaskDtoInterface{
    taskName: string;
    description: string;
    startDate: Date;
    endDate: Date;
    assignUser: string;
    status: boolean;
    taskStatus: string;
    createdAt: Date
}