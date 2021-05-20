"use strict";

import _ from "lodash";
import useragent from "useragent";
import { v4 as uuid } from "uuid";
import logger from "./logger";
import adminRepo from "../repositories/admins";
import mailSrv from "./mail";
import authSrv from "./auth";
import config from "../config";
import { InternalError, BadRequestError, NotFoundError } from "./error";

async function isEmailUsed({ data }) {
  let emailUsed;
  try {
    emailUsed = !!await adminRepo.countDocumentsByFilter({ filter: { email: data.email } });
  } catch (e) {
    const error = "Failed to count documents";
    logger.error(error, e);
    throw new InternalError(error);
  }
  return emailUsed;
}

function adminTokenInfo({ headers }) {
  return new Promise((resolve, reject) => {
    const info = {
      browser: "",
      os: "",
      "user-agent": String(headers["user-agent"]).trim(),
    };

    try {
      const ug = useragent.parse(headers["user-agent"]);
      info.browser = ug.family;
      info.os = ug.os.family;
    } catch (err) {
      return reject("Failed to parse user-agent");
    }

    return resolve(info);
  });
}

async function adminRegister({ data }) {
  data.password = String(data.password).trim();
  data.email = String(data.email).toLowerCase();

  let emailUsed;
  try {
    emailUsed = await isEmailUsed({ data: { email: data.email } });
  } catch (e) {
    const error = "Failed to check email";
    logger.error(error, e, "data.email", email);
    throw new InternalError(error);
  }

  if (emailUsed) {
    const error = "email is already used";
    logger.error(error, "email", data.email);
    throw new BadRequestError(error);
  }

  const userData = {
    login: _.get(data, "login", ""),
    email: data.email,
    password: "",
  };

  try {
    userData.password = await authSrv.passwordHash({ password: data.password });
  } catch (e) {
    const error = "Failed to hash password";
    logger.error(error, e);
    throw new InternalError(error);
  }

  let user;

  try {
    user = await adminRepo.create({
      data: {
        email: userData.email, password: userData.password, login: userData.login
      },
    });
  } catch (e) {
    const error = "Failed to register admin";
    logger.error(error, e);
  }

  const _id = _.get(user, "_id", "");
  if (!_id) {
    const error = "Failed to find registred admin's _id";
    logger.error(error);
    throw new InternalError(error);
  }

  return { _id };
}

async function adminLogin({ data, headers }) {
  data.password = String(data.password).trim();
  data.device = _.get(data, "device", "app") || "device";

  let admin;
  try {
    admin = await adminRepo.findOneByFilter({
      filter: { email: data.email, del: false },
      select: "password",
    });
  } catch (e) {
    const error = `Failed to find admin by email ${data.email}`;
    logger.error(error, e, "data.email", data.email);
    throw new InternalError(error);
  }

  if (!admin) {
    const error = "Invalid credentials";
    logger.error(error, "data.email", data.email);
    throw new BadRequestError(error);
  }

  let passwordOk = false;
  const passwordsPayload = {
    hash: admin.password,
    password: data.password,
  };

  try {
    passwordOk = await authSrv.passwordVerify(passwordsPayload);
  } catch (e) {
    const error = "Failed to verify user's password";
    logger.error(error, e);
    throw new InternalError(error);
  }

  if (!passwordOk) {
    const error = "Invalid credentials";
    logger.error(error, "data.email", data.email);
    throw new BadRequestError(error);
  }

  let info = {};
  try {
    info = await adminTokenInfo({ headers });
  } catch (e) {
    logger.error("Failed to gather info", e);
  }

  let token = "";
  try {
    token = authSrv.generateUsersJWT({
      user: admin, info, longterm: data.longterm, loginMethod: "email", device: data.device,
    });
  } catch (e) {
    const error = "Failed to generate token";
    logger.error(error, e);
    throw new InternalError(error);
  }
  return { token, _id: admin._id };
}

async function adminUpdate({ filter, data }) {
  
  try {
    await adminRepo.updateOneByFilter({
      filter,
      data: { $set: { ...data } },
    });
  } catch (e) {
    const error = "Failed to find admin";
    logger.error(error, e);
    throw new InternalError(error);
  }
  return true;
}

export default {
  adminRegister,
  adminLogin,
  adminUpdate,
};
