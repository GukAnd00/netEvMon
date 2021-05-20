"use strict";

import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  
  login: {
    type: String, trim: true, default: "",
  },

  email: {
    type: String, trim: true, lowercase: true, default: "", 
  },

  emailNotify: {
    type: Boolean, default: false, 
  },

  password: {
    type: String, trim: true, default: "", select: false,
  },

  del: {
    type: Boolean, default: false, index: true, select: false,
  },

  deletedAt: { type: Date, default: null, select: false },

}, { timestamps: true });

AdminSchema.set("toJSON", { virtuals: true, flattenMaps: true });
AdminSchema.set("toObject", { virtuals: true, flattenMaps: true });

mongoose.model("admin", AdminSchema);
