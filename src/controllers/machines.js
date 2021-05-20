"use strict";

import machinesSrv from "../services/machines";
import requestSrv from "../services/request";

async function getMachines(req, res, next) {
  const { filter } = requestSrv.getDataFromRequest(req);
  let machines;
  try {
    machines = await machinesSrv.getMachines({ filter });
  } catch (e) {
    throw e;
  }
  res.status(200).json({ success: true, data: machines });
  return next();
}

async function getMachineById(req, res, next) {
  const { filter } = requestSrv.getDataFromRequest(req);
  let machine;
  try {
    machine = await machinesSrv.getMachineById({ filter });
  } catch (e) {
    throw e;
  }
  res.status(200).json({ success: true, data: machine });
  return next();
}

async function createMachine(req, res, next) {
  const {data} = requestSrv.getDataFromRequest(req);

  let machine;
  // eslint-disable-next-line no-useless-catch
  try {
    machine = await machinesSrv.createMachine({ data });
  } catch (e) {
    throw e;
  }

  res.status(200).json({ success: true, _id: machine._id });
  return next();
}

export default {
  createMachine,
  getMachines,
  getMachineById,
};
