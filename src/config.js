"use strict";

import path from "path";
import pack from "../package.json";

const env = process.env.NODE_ENV || "development";

const isDev = env === "development";

export default {
  env,
  isDev,

  rootDir: path.resolve(`${__dirname}${path.sep}..`) + path.sep,

  port: "PORT" in process.env ? (Number(process.env.PORT) + ("NODE_APP_INSTANCE" in process.env ? Number(process.env.NODE_APP_INSTANCE) : 0)) : 8020,
  host: process.env.HOST || (env === "development" ? "0.0.0.0" : "127.0.0.1"),
  urlMount: process.env.URL_MOUNT || "/api",

  restoreMongoConnectionIntervalSec: process.env.RESTORE_MONGO_CONNECTION_INTERVAL_SEC || 1000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/netevmon",

  server: {
    name: process.env.SERVER_NAME || pack.name,
    version: process.env.SERVER_VERSION || pack.version,
  },

  webhost: process.env.WEBHOST || (isDev ? "" : ""),

  auth: {
    // How long JWT token is valid
    expire: {
      web: {
        longterm: process.env.AUTH_EXPIRE_LONGTERM_WEB || "168h",
        shortterm: process.env.AUTH_EXPIRE_SHORTTERM_WEB || "12h",
      },
      app: {
        longterm: process.env.AUTH_EXPIRE_LONGTERM_APP || "4320h",
        shortterm: process.env.AUTH_EXPIRE_SHORTTERM_APP || "24h",
      },
    },

    secret: process.env.AUTH_SECRET || "very_good_secret_string",
    saltRounds: process.env.AUTH_SALTROUNDS || 10,
    inviteOnly: process.env.AUTH_INVITE_ONLY || false,
  },
  cacheLevels: {
    min: isDev ? 0 : process.env.CACHE_LEVELS_MIN || 60,
    mid: isDev ? 0 : process.env.CACHE_LEVELS_MID || 300,
    max: isDev ? 0 : process.env.CACHE_LEVELS_MAX || 3600,
  },

  reqBody: {
    limit: "50mb",
    parameterLimit: 50000,
  },

  mail: {
    host: process.env.MAIL_HOST || (isDev ? "smtp.gmail.com" : "smtp.gmail.com"),
    port: process.env.MAIL_PORT || (isDev ? 465 : 587),
    secure: !!isDev,
    ignoreTLS: !!isDev,
    debug: !!isDev,
    auth: {
      type: process.env.MAIL_AUTH_TYPE || (isDev ? "OAuth2" : "OAuth2"),
      user: process.env.MAIL_AUTH_USER || (isDev ? "noreply.notevmon@gmail.com" : "noreply.notevmon@gmail.com"),
      userName: isDev ? "NetEvMon" : "NetEvMon",
      pass: process.env.MAIL_AUTH_PASS || (isDev ? "passwordNetEvMon" : "passwordNetEvMon"),
      clientId: process.env.MAIL_AUTH_CLIENT_ID || (isDev ? "814892200232-8p9tfnhncqhnndcl79tnv2rd1rihhjh3.apps.googleusercontent.com" : "814892200232-8p9tfnhncqhnndcl79tnv2rd1rihhjh3.apps.googleusercontent.com"),
      clientSecret: process.env.MAIL_AUTH_CLIENT_SECRET || (isDev ? "4wrr9sAOU8VjSMnxlBajfuC6" : "4wrr9sAOU8VjSMnxlBajfuC6"),
      refreshToken: process.env.MAIL_AUTH_REFRESH_TOKEN || (isDev ? "1//04VVOnrtzYGPzCgYIARAAGAQSNwF-L9IrbTL-AIO6uBsV_4poBc2jIMAR1yDG-5gAZZY9Grt1lWP2WQZbCFRL9QVMsJYFka429GI" : "1//04VVOnrtzYGPzCgYIARAAGAQSNwF-L9IrbTL-AIO6uBsV_4poBc2jIMAR1yDG-5gAZZY9Grt1lWP2WQZbCFRL9QVMsJYFka429GI"),
      accessToken: process.env.MAIL_AUTH_ACCESS_TOKEN || (isDev ? "ya29.a0AfH6SMChk6bI3qZ5w4LN3MnJW4ShKpCY8r2aPJ0bEZnEpQ2sZPcF5CEEVMo8YuJwiTD0_mMbGZODb39yfFd21LR-MDa9vVCxQqKzGnOyVMQs3sGjGn88BffOJ9lPyt3Wlg53Z94093PJXklgsHsm-CrrSlWnaXWrAcTbUKMQoHg" : "ya29.a0AfH6SMChk6bI3qZ5w4LN3MnJW4ShKpCY8r2aPJ0bEZnEpQ2sZPcF5CEEVMo8YuJwiTD0_mMbGZODb39yfFd21LR-MDa9vVCxQqKzGnOyVMQs3sGjGn88BffOJ9lPyt3Wlg53Z94093PJXklgsHsm-CrrSlWnaXWrAcTbUKMQoHg"),
      tokenExpireAt: process.env.MAIL_AUTH_TOKEN_EXPIRE_AT || (isDev ? new Date() : new Date()),
    },
    gmailRedirectUrl: process.env.MAIL_GMAIL_REDIRECT_URL || "https://developers.google.com/oauthplayground",
  },

  periodOfAnalyzing: 1800000,
  periodOfWritingToHistory: 86000000,
  timezoneOffset: 3,

};
