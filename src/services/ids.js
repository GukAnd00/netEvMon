"use strict";

import logger from "./logger";
import machineRepo from "../repositories/machines";
import metricsSrv from "./metrics";
import adminRepo from "../repositories/admins";
import mailSrv from "./mail";
import { InternalError } from "./error";
import config from "../config";
import _ from "lodash";
import { func } from "@hapi/joi";
import { content_v2_1 } from "googleapis";
import { compareSync } from "bcrypt";

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

let statusWorker = false;
let statusHistoryWriter = false;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('.');
}

async function controlIds({ data }) {
    statusWorker = data.statusWorker;
    statusHistoryWriter = data.statusHistoryWriter
    let info ={ workerIds: "", idsHistoryWriter: ""};
    try{
    workerIds();
    }
    catch (e){
        throw new InternalError;
    }
    if (data.statusWorker===true){
    {info.workerIds = "IDS started successfully. To stop, send status:false "}}
    if (data.statusWorker===false){
    {info.workerIds = "IDS stopped successfully. To start, send status:true "}}

    try{
        idsHistoryWriter();}
        catch (e){
            throw new InternalError;
        }
        if (data.statusHistoryWriter===true){
        {info.idsHistoryWriter = "IDS history writer started successfully. To stop, send status:false "}}
        if (data.statusHistoryWriter===false){
        {info.idsHistoryWriter = "IDS history writer stopped successfully. To start, send status:true "}}

        return {info};
}

async function packetsAnalyzer(metricsByIp,machineIp) {
    let health;
    let attack={ip:"",count:0,packets: {key:"", doc_count:0}};
    let reference=config.numberOfPacketsPerPeriod;
    for (let i=0; i<metricsByIp.length; i++){
        if ( ((metricsByIp[i].doc_count/reference)<1.2)&&(metricsByIp[i].key!==machineIp) ) {
            if (health===2){}
            if (health===1||health===0){
            health = 1;}
        }
        if ( ((metricsByIp[i].doc_count/reference)>=1.2&&(metricsByIp[i].doc_count/reference)<=2.1)&&(metricsByIp[i].key!==machineIp) ) {
            health = 2;
        }
        if ( ((metricsByIp[i].doc_count/reference)>2)&&(metricsByIp[i].key!==machineIp) ) {
            health = 3;
            attack.ip=metricsByIp[i].key;
            attack.count=metricsByIp[i].doc_count;

            for (let j=0; j<metricsByIp[i].reqs.buckets.length; j++)
            {
                if (metricsByIp[i].reqs.buckets[j].doc_count>attack.packets.doc_count){
                    attack.packets=metricsByIp[i].reqs.buckets[j];
                }
            }
            console.log(health);
            console.log(attack);
            break;
        }
    }

    return {health, attack};
}

async function workerIds() {
    let timeAtStart;
    let filter;
    let diff;

    while (statusWorker){
        timeAtStart = new Date(Date.now());        
        
        //array of machines
        let machines;
        machines = await machineRepo.findByFilter({filter});
        for (let i=0; i < machines.length; i++){


        //count of all packets for machine
        const overallMetric = await metricsSrv.getMetrics({ 
          filter: {_id: machines[i]._id, date: formatDate(timeAtStart), periodGte: config.periodOfAnalyzing} 
        });

        //count of defined packets for machine
        let byRequestType=[];
        let {reqTypes} = await metricsSrv.getRequestTypes({filter: {_id: machines[i]._id, date: formatDate(timeAtStart)}});
        if (!reqTypes) {reqTypes=[];}
        for (let j=0; j<reqTypes.length; j++){
        const byReqMetric = await metricsSrv.getMetricsByRequests({ 
           filter: {_id: machines[i]._id, date: formatDate(timeAtStart), periodGte: config.periodOfAnalyzing, request: reqTypes[j].key}
        });
        byRequestType.push ({name: reqTypes[j].key, value: byReqMetric.metrics});
        }

        //last packet from machine
        const {lastActivity} = await metricsSrv.getLastActivity({ filter: {_id: machines[i]._id} });
        
        //count packets by ip and type (for dos)
        const {metricsByIp} = await metricsSrv.getMetricsByIp({ filter:{_id: machines[i]._id, date: formatDate(timeAtStart), periodGte: config.periodOfAnalyzing} });
        
        console.log(machines[i].name);
        let health=0;
        let attack;
        console.log(metricsByIp);
        //Analyzing count of packets
        if (metricsByIp.length>1){
            const machineIp = machines[i].ipAddress; 
        let result = await packetsAnalyzer(metricsByIp, machineIp);
        health = result.health;
        attack = result.attack;
        }
        if (attack){
        if (attack.count<2){
            attack={};
        }}
        //sending email
        if (attack){
        if (attack.count>1) {
        let emails = await adminRepo.findByFilter({filter:{},select :"email"});
        let payload = {emails, userName: config.mail.auth.userName, subject: `Machine ${machines[i].name} is under attack!`, text: `Host ${machines[i].name} is under attack: packets: ${attack.packets.key},${attack.packets.doc_count}, from ${attack.ip} for ${config.periodOfAnalyzing/60000} minutes`};
        mailSrv.mail(payload);
        }}

        //saving metrics to mongoDB
        const periodOfMonitoring = `${overallMetric.timestamp}---${overallMetric.dateNowISO}`;
        let data = {
            ipAddress: lastActivity._source.host.ip[0],
            health, 
            attack,
            lastActivity, 
            $push: 
            { numberOfRequestsPerPeriod: 
                { period: periodOfMonitoring, value: overallMetric.metrics, byRequestType } 
            }    
        };
        await machineRepo.updateOneByFilter({filter: {_id: machines[i]._id}, data});


        };
       diff= new Date(Date.now()) - timeAtStart;
       await sleep(config.periodOfAnalyzing-diff);

    }   

}

async function idsHistoryWriter() {
    let timeAtStart;
    let filter;
    let diff;

    while (statusHistoryWriter){
        timeAtStart = new Date(Date.now());
        
        //array of machines
        let machines;
        machines = await machineRepo.findByFilter({filter, select: "attack numberOfRequestsPerPeriod"});
        for (let i=0; i < machines.length; i++){

            let resultByType={};
            let dayMetrics = {};
            let countPerDay=0;
            let requestPerPeriodsNeedDelete=[];
            
            for (let requestsPerPeriod of machines[i].numberOfRequestsPerPeriod){

               //needs to improve
               let date = requestsPerPeriod.period.split('---')[0];

               console.log(timeAtStart.getDate()-new Date(date).getDate());
                // NEED TO EDIT!!!! find if element in numberOfRequestsPerPeriod is outdated
                if (timeAtStart.getDate()-new Date(date).getDate()<=1){
                requestPerPeriodsNeedDelete.push(requestsPerPeriod._id);
                //count number of all packets per day
                countPerDay+=requestsPerPeriod.value;


                //count packets by request type  
                for (let requestType of requestsPerPeriod.byRequestType){
                    resultByType[requestType.name] = (resultByType[requestType.name]? resultByType[requestType.name]: 0) + requestType.value
                }
              
            }

            // date of history to write ( may need modify)
            dayMetrics.date = formatDate(date);
            }
            //making payload
            dayMetrics.value = countPerDay;

            //making array from map
            const resultArrayByType = [];
            for (let key in resultByType){
            resultArrayByType.push({
            name: key,
            value: resultByType[key]
            })}
            dayMetrics.byRequestType = resultArrayByType;
            if (machines[i].attack) {dayMetrics.attack = machines[i].attack;}
            let data = {
              $push: {history: dayMetrics},
            };
            
            if (timeAtStart.getDate()-new Date(dayMetrics.date).getDate()>=1){

            //write to MongoDB
            await machineRepo.updateOneByFilter({filter: {_id: machines[i]._id}, data});
            //delete index from elasticsearch
            let result = await metricsSrv.removeIndex({ filter: {_id: machines[i]._id}, history: dayMetrics});
            console.log(result);
            //delete from MongoDB
            await machineRepo.updateManyByFilter({filter: {_id: machines[i]._id}, data :{ $pull: { numberOfRequestsPerPeriod: { _id : {  $in: requestPerPeriodsNeedDelete} }} } });

            }
        };
        diff= new Date(Date.now()) - timeAtStart;
        await sleep(config.periodOfWritingToHistory-diff);

    }   

}

export default {
  idsHistoryWriter,
  controlIds,
  workerIds,
};
