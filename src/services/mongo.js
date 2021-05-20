import mongoose from "mongoose";
import _ from "lodash";
import logger from "./logger";

async function populate({
  collection, field, modelType, select, populateInner,
}) {
  if (!collection.length) {
    return collection;
  }
  const ids = _.map(collection, (item) => _.get(item, field));

  let items;
  try {
    items = await mongoose.model(modelType).find({ del: false, _id: ids }).select(select).populate(populateInner);
  } catch (e) {
    const error = `Failed to get data for ${modelType} by ids`;
    logger.error(error, e);
    throw new Error(error);
  }

  _.map(collection, (item) => {
    item[field] = _.find(items, (obj) => String(obj._id) === item[field]);
  });
  return collection;
}

function isDuplicateException(e) {
  return _.isObject(e) && _.get(e, "name", "") === "MongoError" && _.get(e, "code", null) === 11000;
}

function validateId({ _id }) {
  return mongoose.Types.ObjectId(_id);
}

export default {
  populate,
  isDuplicateException,
  validateId,
};
