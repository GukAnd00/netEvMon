"use strict";

import mongoose from "mongoose";

const Admin = mongoose.model("admin");

function create({ data }) {
  return new Admin(data).save();
}

function updateOneByFilter({ filter, data, select }) {
  return Admin.findOneAndUpdate(filter, data, { new: true }).select(select);
}

function findOneByFilter({ filter, select, populate }) {
  return Admin.findOne(filter).select(select).populate(populate).lean();
}

function findByFilter({
  filter, skip, limit, populate, select,
}) {
  return Admin.find(filter)
    .skip(skip)
    .limit(limit)
    .populate(populate)
    .select(select)
    .lean();
}

function removeByFilter({ filter }) {
  return Admin.deleteMany(filter);
}

function findById({filter, select}){
  return Admin.findById(filter).select(select);
}

function countDocumentsByFilter({ filter }) {
  return Admin.countDocuments(filter);
}

export default {
  create,
  findById,
  updateOneByFilter,
  findOneByFilter,
  findByFilter,
  removeByFilter,
  countDocumentsByFilter,
};
