import express from "express";
import https from "https";
import fs, { readFileSync } from "fs";
import crypto from "crypto";
import ejs from "ejs";
let finnished={finnished:false};
import { AuthorizationInformation } from "../model/authorization_information";
import { BallotRequest } from "../model/ballot_request";
import { Ballot, fromJSON } from "../model/ballot";
import { count, time } from "console";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { DataService } from "../util/data_service";
import { HttpsServerChannel } from "../util/https_channel";
import { SQLLiteDataService } from "../util/sqlite_data_service";
import { argv } from "process";
import {VoteCounter } from "../model/vote_counter"
import { channel } from "diagnostics_channel";
import { Constants } from "../model/constants";
const BALLOT_COLLECTOR_PORT=3002;

export class BallotCollectorService implements DistributedServerService{
  channel:CommunicationChannel;
  dataService:DataService;
  counter=new VoteCounter()
  private reportFrequency:number;
  private reportToPort:number;
  private reportHost:string
  isValidBallotRequest(dataService:DataService,row:any):boolean{
    let cnt= dataService.count(Constants.TABLE_BALLOTS_ISSUED,(row)=>row["uuid"]==row.id);
    if(cnt>0){
      return false;
    }
    return true;
  }
  run(): void {
    const isValidBallotRequest=this.isValidBallotRequest;
    let dataService=this.dataService;
    let counter=this.counter;
    let meChannel=this.channel;
    this.channel.registerEvent(Constants.EVENT_SUBMIT_BALLOT,HttpMethod.Post, function (request, response) {
      const b=request.body["ballot"];
      const ballot=fromJSON(b,false);
      let foundRow:any;
       for( let row of dataService.queryAll (Constants.TABLE_BALLOTS_ISSUED)){
        if(finnished.finnished){
          return false;
        }
        const compareHash=crypto.createHash("sha256").update(ballot.uuid+row.salt).digest("base64");
    
        if(compareHash==row.id &&  isValidBallotRequest(dataService,row)){
          foundRow=row
       
          for(var group of ballot.groups){
            for(var v of group.votes){
              counter.count(v[1].getKey(),true);
            }
          }
          finnished.finnished=true
          meChannel.send("Successful",null);
          meChannel.end(response);
          
          
      

    
        }
      };
      if(!finnished.finnished){
        meChannel.send("NOT SUCCESSFUL",response);
        meChannel.end(response);
      }
    });
  }
  constructor(channel:CommunicationChannel,dataService:DataService,reportHost:string,reportToPort:number,reportFrequency:number){
    this.channel=channel;
    this.dataService=dataService;
    this.reportHost=reportHost;
    this.reportFrequency=reportFrequency;
    this.reportToPort=reportToPort;
  }

}


if(require.main==module){
  const conf:any={}
  const pki_path=__dirname+"/pki/"

  let channel=HttpsServerChannel.fromJSON("conf/ballot_collector.json",conf,express.urlencoded({extended: true}),pki_path)
  let dataService=new SQLLiteDataService();
  let service=new BallotCollectorService(channel,dataService,conf.report_host,conf.report_port,conf.report_frequency);
  service.run();
}


