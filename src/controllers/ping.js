"use strict";

import config from "../config";

/**
 * @api {get} /ping Health check of system
 * @apiName HealthCheck
 * @apiGroup System
 *
 * @apiSuccess {Boolean} success Request was successfull.
 */
function ping(req, res, next) {
  res.status(200).json({ success: true });
  return next();
}

/**
 * @api {get} /info Information about system
 * @apiName Info
 * @apiGroup System
 *
 * @apiSuccess {String} name Name of service
 * @apiSuccess {Number} pid Pid of process
 * @apiSuccess {Number} uptime Uptime of running service in second
 * @apiSuccess {String} version Version of service
 */
function info(req, res, next) {
  const data = {
    pid: process.pid,
    name: config.server.name,
    version: config.server.version,
    port: config.port,
    uptimeSec: process.uptime(),
  };

  res.status(200).json({ success: true, info: data });
  return next();
}

export default {
  info,
  ping,
};
