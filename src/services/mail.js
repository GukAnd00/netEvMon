/* eslint-disable no-async-promise-executor */
/* eslint-disable no-useless-catch */
import nodemailer from "nodemailer";
import Email from "email-templates";
import { google } from "googleapis";
import fs from "fs";

import path from "path";
import _ from "lodash";

import config from "../config";
import { InternalError } from "./error";
import logger from "./logger";

const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  config.mail.auth.clientId,
  config.mail.auth.clientSecret,
  config.mail.gmailRedirectUrl,
);

oauth2Client.setCredentials({
  refresh_token: config.mail.auth.refreshToken,
});

async function getAccessToken() {
  let responseObj;
  if (new Date() > new Date(config.mail.auth.tokenExpireAt)) {
    try {
      responseObj = await oauth2Client.getAccessToken();
    } catch (e) {
      const error = "Failed to get token from google";
      logger.error(error, e);
      throw new InternalError(error);
    }
    config.mail.auth.tokenExpireAt = new Date(responseObj.res.data.expiry_date);
    config.mail.auth.accessToken = responseObj.token;
    return responseObj.token;
  }

  return config.mail.auth.accessToken;
}

async function createTransport() {
  let accessToken;
  try {
    accessToken = await getAccessToken();
  } catch (e) {
    throw e;
  }

  const authOptions = {
    type: config.mail.auth.type,
    user: config.mail.auth.user,
    clientId: config.mail.auth.clientId,
    clientSecret: config.mail.auth.clientSecret,
    refreshToken: config.mail.auth.refreshToken,
    accessToken,
  };

  const transport = nodemailer.createTransport({
    host: config.mail.host,
    pool: true,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: authOptions,
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  return transport;
}

function mail({
  event, payload = null, date, i,
}) {
  return new Promise(async (resolve, reject) => {
    if (payload === null) {
      payload = {};
    }
    if (!_.hasIn(payload, "lang")) {
      payload.lang = "en";
    }
    if (!_.hasIn(payload, "url")) {
      payload.url = "";
    }

    let transport;
    try {
      transport = await createTransport();
    } catch (e) {
      throw e;
    }

    const email = new Email({
      transport,
      send: true,
      preview: false,
    });

    try {
      const query = {
        message: {
          from: `${payload.userName}<${config.mail.auth.user}>`,
          to: payload.email,
          text: payload.text,
          subject: payload.subject,
          html: payload.html,
        },
        locals: payload,
      };
      if (event) {
        query.template = path.join(__dirname, "components", "emails", event);
      }
      await email.send(query);
    } catch (error) {
      return reject(error);
    }
    logger.info("Sent email to: ", payload.email);
    fs.appendFile(`${payload.subject}_sentTo_${date}.txt`, `${i + 1} ${payload.email}\n`, () => { console.log("written to file"); });
    return resolve();
  });
}

export default {
  mail,
};
