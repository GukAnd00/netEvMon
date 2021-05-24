"use strict";

import ip from "ip";
import cors from "cors";
import logops from "logops";
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import passport from "passport";
import expressRequestId from "express-request-id";
import expressLogging from "express-logging";
import fileUpload from "express-fileupload";
import db from "./services/db";
import logger from "./services/logger";
import authSrv from "./services/auth";
import router from "./routes/index";
import config from "./config";

const addRequestId = expressRequestId();

process.title = config.server.name;

const server = express();
server.use(helmet());
server.use(cors())

// Parse body params and attache them to req.body
server.use(bodyParser.json({ limit: config.reqBody.limit }));
server.use(bodyParser.urlencoded({ limit: config.reqBody.limit, extended: true, parameterLimit: config.reqBody.parameterLimit }));
server.use(addRequestId);
server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
server.use(expressLogging(logops));
server.use(fileUpload());

server.use(passport.initialize());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

server.use(config.urlMount, router.createRouter());

authSrv.initUsersJWT();

async function init() {
  logger.info("Launching node app");

  try {
    await db.init();
  } catch (e) {
    logger.error("DB error", e);
  }

  const serverInstance = server.listen(config.port, config.host, () => {
    logger.info(`${config.server.name.toUpperCase()} v${config.server.version} listening at ${config.host}:${config.port}`);
  });

  // Graceful Shutdown
  process.on("SIGINT", () => {
    logger.info("Stopping server");

    if (serverInstance) {
      serverInstance.close(() => {
        logger.info("Server stopped");
        process.exit(1);
      });
    }
  });
}

export default {
  init,
};
