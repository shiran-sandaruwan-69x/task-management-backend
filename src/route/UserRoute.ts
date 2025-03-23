import express from "express";
import {authorize} from "../middleware/verifyToken";
import {deleteUser, getAllUsers, getAllUsersDetails, saveNewUser, updateUser} from "../controller/UserController";
import {restrictTo} from "../middleware/RoleVerify";


const router = express.Router();

router.post('/',
    authorize,
    restrictTo('admin'),
    saveNewUser
)

router.delete(
    '/',
    authorize,
    restrictTo('admin'),
    deleteUser
)

router.get(
    "/",
    authorize,
    restrictTo('admin'),
    getAllUsers
)

router.put(
    '/',
    authorize,
    updateUser
)


router.get(
    '/all-ie',
    authorize,
    getAllUsersDetails
)

export default router;