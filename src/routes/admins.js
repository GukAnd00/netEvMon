"use strict";

import express from "express";
import adminsCtrl from "../controllers/admins";
import { errorHandle } from "../services/error";
import validatorSrv from "../services/validator";

function createRouter() {
  const router = express.Router();

  router.post("/update",  errorHandle(adminsCtrl.adminUpdate));
  router.post("/register", errorHandle(adminsCtrl.adminsRegister));
  router.post("/login/email", validatorSrv.adminsLoginEmail, errorHandle(adminsCtrl.adminsLoginEmail));

  return router;
}

export default {
  createRouter,
};
