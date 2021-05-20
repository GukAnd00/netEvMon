"use strict";

import _ from "lodash";
import joi from "@hapi/joi";
import logger from "./logger";

const rules = {
  adminsEmailConfirm: {
    email: joi.string().email({ minDomainSegments: 2 }).required(),
    token: joi.string().required(),
  },
  adminsLoginEmail: {
    email: joi.string().email({ minDomainSegments: 2 }).required(),
    password: joi.string().required(),
    longterm: joi.boolean(),
    device: joi.string().valid("web", "app").allow(null),
  },
  adminsGetByFilter: {
    filterToFind: {
      name: joi.string().allow(null),
      role: joi.string().allow(null),
      email: joi.string().allow(null),
      password: joi.string().allow(null),
    },
  },
  adminsUpdate: {
    data: {
      adminId: joi.string().required(),
      admin: {
        name: joi.string().allow(null),
        role: joi.string().allow(null),
        email: joi.string().allow(null),
        password: joi.string().allow(null),
      },
    },
  },
  adminsRegister: {
    name: joi.string().required(),
    email: joi.string().email({ minDomainSegments: 2 }).required(),
    password: joi.string().required(),
    role: joi.string().required(),
    code: joi.string().required(),
  },
  adminsCreate: {
    email: joi.string().required(),
    role: joi.string().required(),
  },
  usersProfileSave: {
    user: {
      name: joi.string().allow(null),
      aboutMe: joi.string().allow(null, ""),
      ageMin: joi.number().allow(null),
      ageMax: joi.number().allow(null),
      gender: joi.string().allow(null).valid("man", "woman", "both"),
      genderPreferences: joi.string().allow(null).valid("man", "woman", "both"),
      profileType: joi.string().valid("matchMaker", "beMatched", "both").default("both"),
      birthday: joi.date().allow(null).less(new Date()),
      location: joi.object({
        type: joi.string().allow(null).valid("Point"),
        coordinates: joi.array().allow(null),
      }),
      avatarImage: joi.string().allow(null, ""),
      allowAutoUpdateApp: joi.boolean(),
      allowEmailNotifications: joi.boolean(),
      allowPushNotifications: joi.boolean(),
      darkMode: joi.boolean(),
    },
  },
};

function getJoiErrorParamName(joierr) {
  const wrongParamPath = _.get(joierr, "details[0].path", []);
  return (Array.isArray(wrongParamPath) ? wrongParamPath.join(" ") : "");
}

const exportObj = { };
_.forEach(rules, (value, key) => {
  exportObj[key] = (req, res, next) => {
    if (!(key in rules)) {
      const error = "Validation rule not found";
      res.status(500).json({ success: false, error });
      return next(error);
    }

    const data = req.method === "GET" ? req.query : req.body;

    if (_.keys(rules[key]).length > 0 && (!data || _.keys(data).length === 0)) {
      const error = "Empty payload";
      logger.warn(`Validation eror: ${error}`);
      res.status(400).json({ success: false, error });
      return next(error);
    }

    const schema = joi.isSchema(rules[key]) ? rules[key] : joi.object(rules[key]);
    const { error: joierr, value: payload } = schema.validate(data);

    if (joierr) {
      const field = getJoiErrorParamName(joierr);
      const error = `Invalid param - ${field}`;

      logger.warn(`Validation eror: ${error}`);

      res.status(400).json({ success: false, error });
      return next(error);
    }

    req.payload = payload;
    return next();
  };

  const keyAllowEmpty = `${key}AllowEmpty`;
  exportObj[keyAllowEmpty] = (req, res, next) => {
    if (!(key in rules)) {
      const error = "Validation rule not found";
      res.status(500).json({ success: false, error });
      return next(error);
    }

    const data = req.method === "GET" ? req.query : req.body;
    if (_.keys(data).length > 0) {
      return exportObj[key](req, res, next);
    }
    return next();
  };
});

export default exportObj;
