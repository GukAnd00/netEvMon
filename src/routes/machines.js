"use strict";

import express from "express";
import authSrv from "../services/auth";
import machinesCtrl from "../controllers/machines";
import { errorHandle } from "../services/error";

function createRouter() {
  const router = express.Router();

  router.post("/get", authSrv.validateUsersJWTToken, errorHandle(machinesCtrl.getMachines));
  router.post("/create", authSrv.validateUsersJWTToken, errorHandle(machinesCtrl.createMachine));

  return router;
}

export default {
  createRouter,
};
