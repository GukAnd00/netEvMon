"use strict";

import express from "express";

import pingRouter from "./ping";
import adminsRouter from "./admins";
import metricsRouter from "./metrics";
import machinesRouter from "./machines";
import idsRouter from "./ids";
var fileUpload = require('express-fileupload');


function createRouter() {
  const router = express.Router();

  router.use("/", pingRouter.createRouter());
  router.use("/admins", adminsRouter.createRouter());
  router.use("/metrics", metricsRouter.createRouter());
  router.use("/machines", machinesRouter.createRouter());
  router.use("/ids", idsRouter.createRouter());

  // Send 404 error if no routes found
  router.use((req, res, next) => {
    if (!res.headersSent) {
      res.status(404)
        .json({
          success: false,
          error: "Invalid url",
        });
    }

    return next();
  });

  router.use(fileUpload({}));
  router.use(express.static('public'));
  return router;
}

export default {
  createRouter,
};
