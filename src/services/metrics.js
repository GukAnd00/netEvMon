"use strict";

import logger from "./logger";
import machineRepo from "../repositories/machines";
import { InternalError } from "./error";
import config from "../config";
import _ from "lodash";
import { date } from "@hapi/joi";

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

client.on('request', (err, result) => {
  if (err) {
      console.log("Error", JSON.stringify(err))
  } else {
    console.log("Elastic request", JSON.stringify(result));
  }
});

client.on('response', (err, result) => {
  if (err) {
    console.log("Error", JSON.stringify(err))
  } else {
    console.log("Elastic response", JSON.stringify(result));
  }
});

async function getMetrics({ filter }) {

  let metrics;

  const date = filter.date;

  let dateNow = new Date(Date.now()+ (3600000*config.timezoneOffset));

  const dateNowISO = dateNow.toISOString();

  let timestamp = new Date(dateNow - filter.periodGte);
  timestamp = timestamp.toISOString();


  if(filter._id) {

    let machine = await machineRepo.findById({filter :{ _id: filter._id}, select: "name"});
    machine = machine.name;
    console.log(dateNowISO,timestamp);
    metrics = _.get(await client.count({ 
      index: `${machine}_packetbeat-${date}-*`,
      body: {
        query: {
          bool: {
            filter: [
              {
                range: 
                {
                  "@timestamp": {
                    "lt": dateNowISO,
                    "gte": timestamp
                  }
                }
              }
            ]
          }
        }
      }
    }),"body.count");
    
    console.log(metrics);
  }

  if(!filter._id) {

    metrics = _.get(await client.count({ 
      index: `*_packetbeat-${date}-*`,
      body: {
        query: {
          bool: {
            filter: [
              {
                range: 
                {
                  "@timestamp": {
                    "lt": dateNowISO,
                    "gte": timestamp
                  }
                }
              }
            ]
          }
        }
      }
    }),"body.count");

    console.log(metrics);
  }

  return { metrics, dateNowISO, timestamp};
}

async function getMetricsByRequests({ filter }) {

  let metrics;

  const date = filter.date;

  let dateNow = new Date(Date.now()+ (3600000*config.timezoneOffset));

  const dateNowISO = dateNow.toISOString();

  let timestamp = new Date(dateNow - filter.periodGte);
  timestamp = timestamp.toISOString();


  if(filter._id) {

    let machine = await machineRepo.findById({filter :{ _id: filter._id}, select: "name"});
    machine = machine.name;
    
    metrics = _.get(await client.count({ 
      index: `${machine}_packetbeat-${date}-*`, 
      body: {
        query: {
          bool: {
            filter: [
              {
                match: 
                {"type": filter.request.trim()}
              },
              {
                range: 
                {
                  "@timestamp": {
                    "lt": dateNowISO,
                    "gte": timestamp
                  }
                }
              }
            ]
          }
        }
      }
    }),"body.count");
    console.log(metrics);
  }

  if(!filter._id) {
  
    metrics = _.get(await client.count({ 
      index: `*_packetbeat-${date}-*`,
      body: {
        query: {
          bool: {
            filter: [
              {
                match: 
                {"type": filter.request.trim()}
              },
              {
                range: 
                {
                  "@timestamp": {
                    "lt": dateNowISO,
                    "gte": timestamp
                  }
                }
              }
            ]
          }
        }
      }
    }),"body.count");

    console.log(metrics);
  }

  return { metrics };
}

async function getLastActivity({ filter }) {

  let lastActivity;

    let machine = await machineRepo.findById({filter :{ _id: filter._id}, select: "name"});
    machine = machine.name;
    
    lastActivity = _.get(await client.search({ 
      index: `${machine}_packetbeat-*`, 
      body: {
        sort: [{ "@timestamp": { "order": "desc" } }],
        size: 1,
        query: { match_all: {}}
      }
    }),"body.hits.hits")[0];

    console.log(lastActivity);

  return { lastActivity };
}

async function getRequestTypes({ filter }) {

  let reqTypes;

  const date = filter.date;

    let machine = await machineRepo.findById({filter :{ _id: filter._id}, select: "name"});
    machine = machine.name;

    reqTypes = _.get(await client.search({ 
      index: `${machine}_packetbeat-${date}-*`, 
      body: {
        aggs : {
          "types" : {
              terms : { field : "type",  size : 50000 }
          }
      }
    }
      
    }),"body.aggregations.types.buckets");

    
    console.log(reqTypes);
    
  return { reqTypes };
}

async function removeIndex({ filter, history }) {

   const date = filter.date;

    let machine = await machineRepo.findById({filter :{ _id: filter._id}, select: "name"});
    machine = machine.name;
    let result=false;

    let count = _.get(await client.count({ 
      index: `${machine}_packetbeat-${history.date}-*`,
    }),"body.count");

    if (count === history.value) 
    { 
    result = client.indices.delete({
      index: `${machine}_packetbeat-${history.date}-*`,
    });
    }
    
    return result;
}

export default {
  getMetrics,
  getMetricsByRequests,
  getLastActivity,
  getRequestTypes,
  removeIndex,
};
