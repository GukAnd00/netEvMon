"use strict";

import express from "express";
import authSrv from "../services/auth";
import metricsCtrl from "../controllers/metrics";
import { errorHandle } from "../services/error";

function createRouter() {
  const router = express.Router();

  router.post("/get", authSrv.validateUsersJWTToken, errorHandle(metricsCtrl.getMetrics));
  router.post("/getLastActivity", authSrv.validateUsersJWTToken, errorHandle(metricsCtrl.getLastActivity));
  router.post("/getByRequest", authSrv.validateUsersJWTToken, errorHandle(metricsCtrl.getMetricsByRequests));

  return router;
}

export default {
  createRouter,
};
