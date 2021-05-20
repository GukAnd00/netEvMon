"use strict";

import mongoose from "mongoose";
import config from "../config";
import logger from "./logger";

const db = mongoose.connection;

let doReconnect = true;
let firstConnectCallback;

function init() {
  if (config.isDev) {
    mongoose.set("debug", true);
  }

  function connectDB() {
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useCreateIndex", true);
    mongoose.set("useFindAndModify", false);

    mongoose.connect(config.MONGO_URI);
  }

  db.on("connected", () => {
    logger.info(`Mongoose connection is open to ${config.MONGO_URI}`);

    if (typeof firstConnectCallback === "function") {
      firstConnectCallback();
    }
  });

  db.on("error", (err) => {
    logger.info(`Mongoose connection has occured ${err} error`);
    mongoose.disconnect();
    if (typeof firstConnectCallback === "function") {
      firstConnectCallback(err);
    }
  });

  db.on("disconnected", () => {
    logger.info("Mongoose connection is disconnected");

    if (doReconnect) {
      logger.info(`Mongoose will try to restore connection to DB in ${config.restoreMongoConnectionIntervalSec} sec`);

      const timerId = setTimeout(() => {
        connectDB();
        clearTimeout(timerId);
      }, (config.restoreMongoConnectionIntervalSec * 1000));
    }
  });

  // Graceful Shutdown
  process.on("SIGINT", () => {
    doReconnect = false;
    if (db.readyState) {
      db.close(() => {
        logger.info("Mongoose connection is disconnected due to application termination");
        process.exit(0);
      });
    }
  });

  return new Promise((resolve, reject) => {
    firstConnectCallback = (error) => {
      firstConnectCallback = null;

      if (error) {
        return reject(error);
      }

      return resolve(true);
    };

    connectDB();
  });
}

export default {
  init,
  db,
};
