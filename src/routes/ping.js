"use strict";

import express from "express";

import pingCtrl from "../controllers/ping";

function createRouter() {
  const router = express.Router();

  router.get("/ping", pingCtrl.ping);
  router.get("/info", pingCtrl.info);

  return router;
}

export default {
  createRouter,
};
