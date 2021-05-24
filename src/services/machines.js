"use strict";

import logger from "./logger";
import machineRepo from "../repositories/machines";
import { InternalError } from "./error";
import config from "../config";
import _ from "lodash";

async function getMachines({ filter }) {
  let machines;

  if(filter._id) {

    try {
      machines = await machineRepo.findById({ filter, select: "name ipAddress health numberOfRequestsPerPeriod lastActivity history" });
    } catch (e) {
      const error = `Failed to find machine by id`;
      logger.error(error, e);
      throw new InternalError(error);
    }

  }

  if(!filter._id) {

  const limit = filter.limit;
  const skip = filter.skip;
  filter = { 
    name : {$regex: new RegExp(filter.name, "i")},
  };

  try {
    machines = await machineRepo.findByFilter({ filter, select: "name ipAddress health numberOfRequestsPerPeriod lastActivity", skip, limit });
  } catch (e) {
    const error = `Failed to find machines`;
    logger.error(error, e);
    throw new InternalError(error);
  }

  }

  return { machines };
}

async function createMachine({ data }) {
    data.name = String(data.name).toLowerCase().trim();
    let machine;
  
    try {
      machine = await machineRepo.create({
        data: {
          name: data.name
        },
      });
    } catch (e) {
      const error = "Failed to create machine";
      logger.error(error, e);
    }
  
    const _id = _.get(machine, "_id", "");
    if (!_id) {
      const error = "Failed to find created machine's _id";
      logger.error(error);
      throw new InternalError(error);
    }
  
    return { _id };
}

async function updateMachine({ filter, data }) {
  
  try {
    await machineRepo.updateOneByFilter({
      filter,
      data: { $set: { ...data } },
    });
  } catch (e) {
    const error = "Failed to find machine";
    logger.error(error, e);
    throw new InternalError(error);
  }
  return true;
}

export default {
  createMachine,
  getMachines,
  updateMachine,
};
