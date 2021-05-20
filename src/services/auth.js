// http://www.passportjs.org/packages/passport-jwt/

"use strict";

import _ from "lodash";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passport from "passport";
import passportjwt from "passport-jwt";

import config from "../config";

const User = mongoose.model("admin");

// Make hash from pasword
function passwordHash({ password }) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, config.auth.saltRounds, (err, hash) => {
      if (err) {
        return reject(err);
      }

      return resolve(hash);
    });
  });
}

// Compare two hashes if they have same password
function passwordVerify({ password, hash }) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) {
        return reject(err);
      }

      return resolve(res);
    });
  });
}

function usersTokenVerify(payload, cb) {
  const userIdStr = _.get(payload, "user._id", null);
  if (!userIdStr) {
    return cb("Invalid payload - user id not found");
  }

  let _id = null;
  try {
    _id = mongoose.Types.ObjectId(userIdStr);
  } catch (e) {
    return cb("Failed to create ObjectId from user._id");
  }

  User.findOne({ _id, del: false }).lean().exec((err, u) => {
    if (err) {
      return cb(err);
    }

    if (!u) {
      return cb("user not found");
    }

    if (u.blocked) {
      return cb("User is blocked");
    }

    return cb(null, u);
  });
}

// Generate new token with expiration
function generateJWT({ payload, expiresIn = "12h" }) {
  let opt = null;
  if (expiresIn) {
    opt = { expiresIn };
  }

  return jwt.sign(payload, config.auth.secret, opt);
}

function generateUsersJWT({
  user, info = {}, longterm = false, loginMethod = "unknown", device = "web",
}) {
  return generateJWT({ payload: { user: { _id: user._id, roles: user.roles, lgc: user.lgc }, info, loginMethod }, expiresIn: (longterm ? config.auth.expire[device].longterm : config.auth.expire[device].shortterm) });
}

function initUsersJWT() {
  const opts = {};
  opts.jwtFromRequest = passportjwt.ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.auth.secret;
  passport.use("usersJWT",
    new passportjwt.Strategy(opts, usersTokenVerify));
}

// Middleware to validate users token in routers
function validateUsersJWTToken(req, res, next) {
  const error = "Invalid token";
  if (!_.get(req, "headers.authorization", null)) {
    res.status(401).json({ success: false, error, auth: false });
    return next(error);
  }

  passport.authenticate("usersJWT", { session: false }, (e2, user) => {
    if (e2) {
      res.status(401).json({ success: false, error, auth: false });
      return next(error);
    }

    if (!user) {
      res.status(401).json({ success: false, error, auth: false });
      return next(error);
    }

    req.user = user;
    return next();
  })(req, res, next);
}

export default {
  generateUsersJWT,
  passwordHash,
  passwordVerify,
  initUsersJWT,
  validateUsersJWTToken,
};
