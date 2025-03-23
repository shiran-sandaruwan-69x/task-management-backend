import express from "express";
import TaskModel from "../model/TaskModel";
import {AppError} from "../util/AppError";
import {StatusCodes} from "../util/StatusCode";
import {CustomResponse} from "../util/CustomResponse";
import UserModel from "../model/UserModel";
import mongoose from "mongoose";

export const creatTask = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { taskName, description, startDate, endDate, assignUser, status } = req.body;

        // Validate fields
        if (!taskName || !description || !startDate || !endDate || !assignUser || status === undefined) {
            throw new AppError(
                'Some data are missing! Please try again later!',
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(assignUser)) {
            throw new AppError(
                'User ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Find assign user in db
        const userById =
            await UserModel.findById(assignUser).select('-password').lean();

        if (!userById || !userById.status){
            throw new AppError(
                'User not found! Please enter available user.',
                404,
                StatusCodes.USER_NOT_FOUND
            )
        }

        // Create new task
        const newTask = new TaskModel({
            taskName,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            assignUser,
            status
        });

        // Save task to database
        await newTask.save();

        res.status(201).json(
            new CustomResponse(
                StatusCodes.TASK_CREATE_SUCCESSFULLY,
                "Task created successfully",
                newTask
            )
        );

    }catch (error){
        next(error)
    }

}

export const deleteTask = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const taskId = req.query.taskId as string;

        // Check if taskId is provided
        if (!taskId) {
            throw new AppError(
                'Task ID is missing! Please try again later!',
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(taskId)){
            throw new AppError(
                'Task ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Find and delete
        const deletedTask = await TaskModel.findByIdAndDelete(taskId);

        if (!deletedTask) {
            throw new AppError(
                "Task not found",
                404,
                StatusCodes.TASK_NOT_FOUND
            )
        }

        res.status(200).json(
            new CustomResponse(
                StatusCodes.TASK_DELETE_SUCCESSFULLY,
                "Task deleted successfully",
                deletedTask
            )
        );

    } catch (error){
        next(error)
    }

}

export const updateTask = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {
        const taskId = req.query.taskId as string;
        const { taskName, description, startDate, endDate, assignUser, status } = req.body;

        // Check if taskId is provided
        if (!taskId) {
            throw new AppError(
                'Task ID is missing! Please try again later!',
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            throw new AppError(
                'Task ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Find the task and update only provided fields
        const updatedTask = await TaskModel.findByIdAndUpdate(
            taskId,
            {
                ...(taskName && { taskName }),
                ...(description && { description }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(assignUser && { assignUser }),
                ...(status !== undefined && { status }),
            },
            // Return the updated task
            { new: true }
        );

        if (!updatedTask) {
            throw new AppError(
                "Task not found",
                404,
                StatusCodes.TASK_NOT_FOUND
            )
        }

        res.status(200).json(
            new CustomResponse(
                StatusCodes.TASK_UPDATE_SUCCESSFULLY,
                "Task updated successfully",
                updatedTask
            )
        );


    }catch (error){
        next(error)
    }
}

export const getAllTasks = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { page, limit, taskName, assignUser, status, description, startDate, endDate, completeDate, firstName } = req.query;

        // Pagination defaults
        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Create dynamic filters ----------------------------
        let filters: any = {};

        if (taskName && taskName !== 'null') filters.taskName = { $regex: taskName, $options: "i" };
        if (assignUser && assignUser !== 'null') filters.assignUser = { $regex: assignUser, $options: "i" };
        if (description && description !== 'null') filters.description = { $regex: description, $options: "i" };
        if ( status === 'true' || status === 'false' ) filters.status = status === "true";



        if (startDate && startDate !== 'null'){
            const startOfDay = new Date(startDate as string);
            // 12:00 AM
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startDate as string);
            // 11:59:59 PM
            endOfDay.setHours(23, 59, 59, 999);

            filters.startDate =
                { $gte: startOfDay, $lte: endOfDay };
        }

        if (endDate && endDate !== 'null'){
            const startOfDay = new Date(endDate as string);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(endDate as string);
            endOfDay.setHours(23, 59, 59, 999);

            filters.endDate =
                { $gte: startOfDay, $lte: endOfDay };
        }

        if (completeDate && completeDate !== 'null'){
            const startOfDay = new Date(completeDate as string);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(completeDate as string);
            endOfDay.setHours(23, 59, 59, 999);

            filters.completeDate =
                { $gte: startOfDay, $lte: endOfDay };
        }

        if (firstName && firstName !== 'null'){
            const userByName = await UserModel.findOne({
                firstName: { $regex: firstName, $options: "i" }
            }).lean();

            filters.assignUser = userByName._id
        }

        //-----------------------------------------------------

        // Get total tasks count
        const totalRecodes = await TaskModel.countDocuments(filters);
        // Total pages
        const totalPages = Math.ceil(totalRecodes / limitNumber)

        // Get task recodes - as a JSON objects
        const tasks =
            await TaskModel.find(filters).populate('assignUser', '_id firstName lastName').skip(skip).limit(limitNumber).sort({ createdAt: -1 }).lean();

        res.status(200).send(
            new CustomResponse(
                StatusCodes.DATA_FOUND_SUCCESSFULLY,
                "Tasks found successfully.",
                tasks,
                totalPages,
                totalRecodes,
                pageNumber
            )
        )

    }catch (error){
        next(error)
    }

}

export const getTaskById = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const taskId = req.params.id;

        if (!taskId){
            throw new AppError(
                'Task ID is missing! Please try again later!',
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            throw new AppError(
                'Task ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Fine task by id
        const taskById = await TaskModel.findById(taskId).lean();

        if (!taskById){
            throw new AppError(
                "Task not found",
                404,
                StatusCodes.TASK_NOT_FOUND
            )
        }

        res.status(200).json(
            new CustomResponse(
                StatusCodes.DATA_FOUND_SUCCESSFULLY,
                "Task found successfully",
                taskById
            )
        );

    } catch (error){
        next(error)
    }

}

export const changeTaskStatus = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { taskId, completeDate, taskStatus } = req.body;

        if (!taskId || !taskStatus){
            throw new AppError(
                'Some data are missing! Please try again later!',
                400,
                StatusCodes.DATA_NOT_FOUND
            )
        }

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            throw new AppError(
                'Task ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Find the task and update only provided fields
        const updatedTask = await TaskModel.findByIdAndUpdate(
            taskId,
            {
                completeDate:completeDate ? new Date(completeDate) : null,
                taskStatus: taskStatus
            },
            // Return the updated task
            { new: true }
        );

        if (!updatedTask) {
            throw new AppError(
                "Task not found",
                404,
                StatusCodes.TASK_NOT_FOUND
            )
        }

        res.status(200).json(
            new CustomResponse(
                StatusCodes.TASK_UPDATE_SUCCESSFULLY,
                "Task updated successfully",
                updatedTask
            )
        );

    } catch (error){
        next(error)
    }

}

export const getAllTaskByUserId = async (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {

    try {

        const { page, limit, taskName, userId, status, description, startDate, endDate, completeDate, taskStatus } = req.query;

        // Pagination defaults
        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        // Validate Object id
        if (!mongoose.Types.ObjectId.isValid(userId as string)) {
            throw new AppError(
                'User ID is invalid! Please enter valid id!',
                400,
                StatusCodes.INVALID_INPUT
            )
        }

        // Create dynamic filters ----------------------------
        let filters: any = {
            assignUser:userId,
            status:true
        };

        if (taskName && taskName !== 'null') filters.taskName = { $regex: taskName, $options: "i" };
        if (description && description !== 'null') filters.description = { $regex: description, $options: "i" };
        if ( taskStatus && taskStatus !== 'null' ) filters.taskStatus = taskStatus;

        if (startDate && startDate !== 'null'){
            const startOfDay = new Date(startDate as string);
            // 12:00 AM
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startDate as string);
            // 11:59:59 PM
            endOfDay.setHours(23, 59, 59, 999);

            filters.startDate =
                { $gte: startOfDay, $lte: endOfDay };
        }

        if (endDate && endDate !== 'null'){
            const startOfDay = new Date(endDate as string);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(endDate as string);
            endOfDay.setHours(23, 59, 59, 999);

            filters.endDate =
                { $gte: startOfDay, $lte: endOfDay };
        }

        if (completeDate && completeDate !== 'null'){
            const startOfDay = new Date(completeDate as string);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(completeDate as string);
            endOfDay.setHours(23, 59, 59, 999);

            filters.completeDate =
                { $gte: startOfDay, $lte: endOfDay };
        }

        //-----------------------------------------------------

        // Get total tasks count
        const totalRecodes = await TaskModel.countDocuments(filters);
        // Total pages
        const totalPages = Math.ceil(totalRecodes / limitNumber)

        // Get task recodes - as a JSON objects
        const tasks =
            await TaskModel.find(filters).populate('assignUser', '_id firstName lastName').skip(skip).limit(limitNumber).sort({ createdAt: -1 }).lean();

        res.status(200).send(
            new CustomResponse(
                StatusCodes.DATA_FOUND_SUCCESSFULLY,
                "Tasks found successfully.",
                tasks,
                totalPages,
                totalRecodes,
                pageNumber
            )
        )

    } catch (error){
        next(error)
    }

}