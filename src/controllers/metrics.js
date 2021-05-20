"use strict";

import metricsSrv from "../services/metrics";
import requestSrv from "../services/request";
import { InternalError } from "../services/error";

async function getMetrics(req, res, next) {
  const { filter } = requestSrv.getDataFromRequest(req);
  let metrics;
  try {
    metrics = await metricsSrv.getMetrics({ filter });
  } catch (e) {
    throw e;
  }
  res.status(200).json({ success: true, data: metrics });
  return next();
}

async function getMetricsByRequests(req, res, next) {
  const { filter } = requestSrv.getDataFromRequest(req);
  let metrics;
  try {
    metrics = await metricsSrv.getMetricsByRequests({ filter });
  } catch (e) {
    throw e;
  }
  res.status(200).json({ success: true, data: metrics });
  return next();
}

async function getLastActivity(req, res, next) {
  const { filter } = requestSrv.getDataFromRequest(req);
  let lastActivity;
  try {
    lastActivity = await metricsSrv.getLastActivity({ filter });
  } catch (e) {
    throw e;
  }
  res.status(200).json({ success: true, data: lastActivity });
  return next();
}

export default {
  getMetrics,
  getMetricsByRequests,
  getLastActivity
};
