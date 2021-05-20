"use strict";

import adminsSrv from "../services/admins";
import requestSrv from "../services/request";

async function adminsRegister(req, res, next) {
  const userData = requestSrv.getDataFromRequest(req);

  let data;
  // eslint-disable-next-line no-useless-catch
  try {
    data = await adminsSrv.adminRegister({ data: userData });
  } catch (e) {
    throw e;
  }

  res.status(200).json({ success: true, _id: data._id });
  return next();
}

async function adminsLoginEmail(req, res, next) {
  const data = requestSrv.getDataFromRequest(req);
  const { headers } = req;

  let response;
  // eslint-disable-next-line no-useless-catch
  try {
    response = await adminsSrv.adminLogin({ data, headers });
  } catch (e) {
    throw e;
  }

  res.status(200).json({ success: true, token: response.token, _id: response._id });
  return next();
}

async function adminUpdate(req, res, next) {
  const data = requestSrv.getDataFromRequest(req);
  let admin;
  // eslint-disable-next-line no-useless-catch
  try {
    admin = await adminsSrv.updateProfile({ data });
  } catch (e) {
    throw e;
  }
  res.status(200).json({ success: true, admin });
 return next();
}


export default {
  adminsRegister,
  adminsLoginEmail,
  adminUpdate,
};
