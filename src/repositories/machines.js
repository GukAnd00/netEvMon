"use strict";

import mongoose from "mongoose";

const Machine = mongoose.model("machine");

function create({ data }) {
  return new Machine(data).save();
}

function updateOneByFilter({ filter, data, select }) {
  return Machine.findOneAndUpdate(filter, data, { new: true }).select(select);
}

function findOneByFilter({ filter, select, populate }) {
  return Machine.findOne(filter).select(select).populate(populate).lean();
}

function findByFilter({
  filter, skip, limit, populate, select, sort,
}) {
  return Machine.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate(populate)
    .select(select)
    .lean();
}

function removeByFilter({ filter }) {
  return Machine.deleteMany(filter);
}

function countDocumentsByFilter({ filter }) {
  return Machine.countDocuments(filter);
}

function findById({filter, select}){
  return Machine.findById(filter).select(select).lean();
}

function aggregateByFilter({ filter }) {
  return Machine.aggregate(filter);
}

function findDistinct({ filter }) {
  return Machine.distinct(filter);
}

export default {
  create,
  findById,
  updateOneByFilter,
  findOneByFilter,
  findByFilter,
  removeByFilter,
  countDocumentsByFilter,
  aggregateByFilter,
  findDistinct,
};
