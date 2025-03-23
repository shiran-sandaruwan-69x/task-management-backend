import nodemailer from 'nodemailer'
import {EMAIL_HOST, EMAIL_PASS, EMAIL_PORT, EMAIL_SERVICE, EMAIL_USER} from "../config/env";
import process from "process";
import {EmailOptions} from "../dto/EmailOptions";

export const sendEmail = async (options:EmailOptions) => {

    //create transporter
    const transport = nodemailer.createTransport({
        service:EMAIL_SERVICE,
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT),
        secure: true,
        auth: {
            user:EMAIL_USER,
            pass:EMAIL_PASS
        }
    });

    //define the email options
    const emailOptions = {
        from: `Task Manager < ${process.env.EMAI_USER} >`, // sender address
        to: options.emailTo, // list of receivers
        subject: options.subject, // Subject line
        text: options.message || "", // plain text body
        html: options.html ||  "", // html body
    }

    //send email
    await transport.sendMail(emailOptions)

}