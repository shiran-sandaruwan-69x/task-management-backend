import {UserDTO} from "../dto/UserDTO";
import {JWT_EXPIRES_IN, JWT_SECRET} from "../config/env";
import jwt, {Secret} from "jsonwebtoken";

const generateAccessToken = async (user:UserDTO) => {

    return jwt.sign({user: user}, JWT_SECRET as Secret, {expiresIn: '1w'})

}

export default generateAccessToken;