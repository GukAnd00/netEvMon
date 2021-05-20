"use strict";

import mongoose from "mongoose";

const MachineSchema = new mongoose.Schema({

  name: {
    type: String, trim: true, default: "",
  },

  ipAddress: {
    type: String, trim: true, default: "",
  },

  numberOfRequestsPerPeriod: [{
    period : String,
    value : Number,
    byRequestType: [{
      name : String,
      value : Number,
    }],
  }],

  health: {
    type: Number,
  },

  history: [{
    date : String,
    value : Number,
    byRequestType: [{
      name : String,
      value : Number,
    }],
  }],

  lastActivity: {
    type: Object,
  }

}, { timestamps: true });

MachineSchema.set("toJSON", { virtuals: true, flattenMaps: true });
MachineSchema.set("toObject", { virtuals: true, flattenMaps: true });

mongoose.model("machine", MachineSchema);
