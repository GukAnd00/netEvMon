"use strict";

import express from "express";
import authSrv from "../services/auth";
import idsCtrl from "../controllers/ids";
import { errorHandle } from "../services/error";

function createRouter() {
  const router = express.Router();

  router.post("/control", authSrv.validateUsersJWTToken, errorHandle(idsCtrl.controlIds));

  return router;
}

export default {
  createRouter,
};
