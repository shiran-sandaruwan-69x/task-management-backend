import {config} from "dotenv";
import * as process from "process";

config({path: `.env.${process.env.NODE_ENV || 'development'}.local`});

export const {
    PORT,
    NODE_ENV,
    MONGO_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SERVICE,
    EMAIL_PORT,
    EMAIL_HOST
} = process.env;