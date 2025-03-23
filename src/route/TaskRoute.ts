import express from "express";
import {authorize} from "../middleware/verifyToken";
import {
    creatTask,
    deleteTask,
    getAllTasks,
    getTaskById,
    changeTaskStatus,
    updateTask, getAllTaskByUserId
} from "../controller/TaskController";
import {getAllUsersDetails} from "../controller/UserController";
import {restrictTo} from "../middleware/RoleVerify";

const router = express.Router();

router.post(
    '/',
    authorize,
    restrictTo('admin'),
    creatTask
)

router.delete(
    '/',
    authorize,
    restrictTo('admin'),
    deleteTask
)

router.put(
    '/',
    authorize,
    updateTask
)

router.put(
    '/status',
    authorize,
    changeTaskStatus
)

router.get(
    '/',
    authorize,
    getAllTasks
)

router.get(
    '/user',
    authorize,
    getAllTaskByUserId
)


router.get(
    '/:id',
    authorize,
    getTaskById
)


export default router;