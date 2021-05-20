"use strict";

import logger from "./logger";
import { InternalError } from "./error";
import config from "../config";
import feedbacksRepo from "../repositories/feedbacks"
import mailSrv from "./mail";
import communitiesRepo from "../repositories/communities";

async function createFeedback({ data }) {

  if (data.communityName) {data.email = await communitiesRepo.findOneByFilter( {filer: {name: data.communityName}, populate: "admin" }).email;}
  if (!data.communityName) {data.email = config.emails.askQuestionMail}

    const emailPayload = {
      email: data.email,
      subject: config.emails.subjectForFeedback,
      userName: config.mail.auth.userName,
      text,
    }
    try {
      mailSrv.mail({ payload: emailPayload });
    } catch (e) {
      const error = "Failed to send mail";
      logger.error(error, e, emailPayload);
    }

  return { success: true};
}

export default {
  createFeedback,
};
