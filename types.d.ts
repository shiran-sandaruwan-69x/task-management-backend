import {UserDtoInterface} from "./src/types/DtoTypes";
import { Request } from "express";

export interface TokenData {
    user:UserDtoInterface
}


declare module 'express-serve-static-core' {
    interface Request {
        tokenData?: TokenData;
    }

}
