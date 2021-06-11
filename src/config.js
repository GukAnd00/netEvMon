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
    port: process.env.MAIL_PORT || (isDev ? 587 : 587),
    secure: false,
    ignoreTLS: false,
    debug: !!isDev,
    auth: {
      userName: "Network Events Monitor",
      user: process.env.MAIL_AUTH_USER || (isDev ? "noreply.notevmon@gmail.com" : "noreply.notevmon@gmail.com"),
      pass: process.env.MAIL_AUTH_PASS || (isDev ? "passwordNetEvMon" : "passwordNetEvMon"),
    },
  },

  periodOfAnalyzing: 180000,
  periodOfWritingToHistory: 86000000,
  timezoneOffset: 3,
  numberOfPacketsPerPeriod:12000,

};
