import express from "express";
import https from "https";
import fs, { readFileSync } from "fs";
import crypto from "crypto";
import ejs from "ejs";
import { AuthorizationInformation } from "../model/authorization_information";
import { BallotRequest } from "../model/ballot_request";
import { Ballot } from "../model/ballot";
import { time } from "console";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsServerChannel } from "../util/https_channel";
import { DataService } from "../util/data_service";
import { SQLLiteDataService } from "../util/sqlite_data_service";
import { argv } from "process";
import { BallotAuthorization } from "../model/ballot_authorization_interface";
import { Constants } from "../model/constants";
export class BallotProviderService implements DistributedServerService{
  channel: CommunicationChannel;
  private db:any;
  private dataService:DataService;
    isValidBallotRequest(dataService:DataService,row:any):boolean{
    let cnt= dataService.count("BallotsIssued",(row)=>row["uuid"]==row.id);
    if(cnt>0){
      return false;
    }
    return true;
  }
  sendBallot(ballot:string,responseObject:any){
  let instance=this;
    ejs.renderFile(__dirname+"/ballot_templates/html_template.ejs", {ballot}, function(err, str){
      instance.channel.send(str,responseObject);
      instance.channel.end(responseObject)
    });
   
  }
  run(): void {
    let service=this.dataService;
    let channel=this.channel;
    let me=this;
    let isValidBallotRequest=this.isValidBallotRequest;
    this.channel.registerEvent(Constants.EVENT_GET_BALLOT,HttpMethod.Post, function (request, response) {
      const body=request.body as BallotRequest ;
      let foundRow:any|null=null;
      service.query(Constants.TABLE_BALLOT_AUTHORIZATION,async (row:any)=>{
        const compareHash=crypto.createHash("sha256").update(body.uuid+row.salt).digest("base64");
        const timeDiff=body.time-row.time;
        if(compareHash==row.id &&  isValidBallotRequest(service,row)){
          foundRow=row
        }
      },(x)=>true);
      if(foundRow!==null){
        service.insert(Constants.TABLE_BALLOTS_ISSUED,{"id":foundRow!!.id,"salt":foundRow.salt,"time":Date.now()})
        let ballot=JSON.parse(readFileSync(__dirname+"/ballot_templates/bundestag.json",{encoding:"utf-8"})) ;
        ballot.uuid=body.uuid;
       
        me.sendBallot(ballot,response)
      } 
    });}
  constructor(channel:CommunicationChannel,dataService:DataService){
    this.channel=channel;
   this.dataService=dataService;
  }
}
if(require.main==module){

  const pki_path=__dirname+"/pki/"
  let channel=HttpsServerChannel.fromJSON("conf/ballot_provider.json",{},express.json(),pki_path)
 let service=new BallotProviderService(channel, new SQLLiteDataService());
 service.run();
}


