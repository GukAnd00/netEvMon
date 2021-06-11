/* eslint-disable no-async-promise-executor */
/* eslint-disable no-useless-catch */
import nodemailer from "nodemailer";

import _ from "lodash";

import config from "../config";
import { InternalError } from "./error";
import logger from "./logger";
import { contentSecurityPolicy } from "helmet";

// async..await is not allowed in global scope, must use a wrapper
async function mail(payload) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.auth.user,
      pass: config.mail.auth.pass,
    },
  });
  for (let i=0; i<payload.emails.length; i++){
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `${payload.userName}<${config.mail.auth.user}>`,// sender address
    to: payload.emails[i].email, // list of receivers
    text: payload.text, // plain text body
    subject: payload.subject, // Subject line
  });

  console.log("Message sent: %s", info.messageId);
 }
}

export default {
  mail,
};
