"use strict";

import idsSrv from "../services/ids";
import requestSrv from "../services/request";

async function controlIds(req, res, next) {
  const {data} = requestSrv.getDataFromRequest(req);

  let status;
  // eslint-disable-next-line no-useless-catch
  try {
    status = await idsSrv.controlIds({ data });
  } catch (e) {
    throw e;
  }

  res.status(200).json({ success: true, status: status.info });
  return next();
}

export default {
  controlIds,
};
