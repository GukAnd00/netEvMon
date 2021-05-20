"use strict";

import logger from "logops";
import os from "os";

logger.format = logger.formatters.dev;
// logger.format = logger.formatters.json;

const hostname = os.hostname();
logger.getContext = function getContext() {
  return {
    hostname,
    pid: process.pid,
    time: new Date(),
  };
};

export default logger;
