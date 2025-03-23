// Config dot env
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import {MONGO_URL, PORT} from "./config/env";
import bodyParser from "body-parser";
import cors from 'cors'
import * as mongoose from "mongoose";
import UserModel from "./model/UserModel";
import {StatusCodes} from "./util/StatusCode";
import {AppError} from "./util/AppError";
import * as GlobalErrorHandler from './exception/ExceptionHandler'
import UserRoute from "./route/UserRoute";
import AuthRoute from "./route/AuthRoute";
import TaskRoute from "./route/TaskRoute";

let app = express();

app.use(
    cors({
        origin:'*',
        methods:'*',
        credentials:true
    })
);

app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));

//server port
const port = PORT || 5000;

//------------------------------------------------------------

//create mongodb connection
mongoose.connect(MONGO_URL as string).then( r => {
    console.log("DB Connected Successfully");
}).catch( error => {
    console.log(`DB Connection Error : ${error}`);
});

//---------------------- ROUTES ------------------------------

app.use('/api/auth', AuthRoute)
app.use('/api/users', UserRoute)
app.use('/api/tasks', TaskRoute)

/**
 this should always be the end of the routs,
 this is for a handle to unhandled routes
 */
app.all('*', (
    req:express.Request,
    res:express.Response,
    next:express.NextFunction
) => {
    next(
        new AppError(
            `Can't find ${req.originalUrl} path on the auth server`,
            404,
            StatusCodes.URL_NOT_FOUND
        ));
});

//------------------------------------------------------------

//set global exception handler
app.use(GlobalErrorHandler.exceptionHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});