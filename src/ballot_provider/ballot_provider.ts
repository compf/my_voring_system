import express from "express";
import https from "https";
import fs, { readFileSync } from "fs";
import crypto from "crypto";
import ejs from "ejs";
import { AuthorizationInformation } from "../common/authorization_information";
import { BallotRequest } from "../common/ballot_request";
import { Ballot } from "../common/ballot";
import { time } from "console";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsServerChannel } from "../util/https_channel";
import { DataService } from "../util/data_service";
import { SQLLiteDataService } from "../util/sqlite_data_service";
import { argv } from "process";
export class BallotProviderService implements DistributedServerService{
  channel: CommunicationChannel;
  private db:any;
  private dataService:DataService;
    isValidBallotRequest(dataService:DataService,row:any):boolean{
    let cnt= dataService.count("BallotsIssued",(row)=>row["uuid"]==row.id);
    console.log(cnt)
    if(cnt>0){
      return false;
    }
    return true;
  }
  sendBallot(ballot:string,responseObject:any){
  let instance=this;
    ejs.renderFile(__dirname+"/ballot_templates/html_template.ejs", {ballot}, function(err, str){
      console.log(str,err);
      instance.channel.send(str,responseObject);
      instance.channel.end(responseObject)
    });
   
  }
  run(): void {
    let service=this.dataService;
    let channel=this.channel;
    let me=this;
    let isValidBallotRequest=this.isValidBallotRequest;
    this.channel.registerEvent("/getBallot",HttpMethod.Post, function (request, response) {
      console.log("request")
      const body=request.body as BallotRequest ;
      console.log(body);
      let foundRow:{id:string,salt:string}={salt:"",id:""}
      service.query("BallotAuthorization",async (row:any)=>{
        console.log("both",body.uuid+row.salt)
        const compareHash=crypto.createHash("sha256").update(body.uuid+row.salt).digest("base64");
    
        console.log("hash",row.id,compareHash);
        console.log()
        const timeDiff=body.time-row.time;
       // console.log(compareHash);
        if(compareHash==row.id &&  isValidBallotRequest(service,row)){
          console.log("compared")
          foundRow=row
         
         
    
        }
      },(x)=>true);
      service.insert("BallotsIssued",{"id":foundRow!.id,"salt":foundRow.salt,"time":Date.now()})
      let ballot=JSON.parse(readFileSync(__dirname+"/ballot_templates/bundestag.json",{encoding:"utf-8"})) ;
      ballot.uuid=body.uuid;
      for(let v of ballot.groups[0].choices){
        console.log(v);
      }
      me.sendBallot(ballot,response)
     // console.log(ballot.groups[0].choices);
 
    });}
  constructor(channel:CommunicationChannel,dataService:DataService){
    this.channel=channel;
   this.dataService=dataService;
  }
}
if(require.main==module){

  const pki_path=__dirname+"/pki/"
  const BALLOT_PROVIDER_PORT=1998;
  //let channel=new HttpsServerChannel(BALLOT_PROVIDER_PORT,  pki_path+"ballot_provider.key.pem",pki_path+"ballot_provider.cert.pem",false,express.json());
  let channel=HttpsServerChannel.fromJSON("conf/ballot_provider.json",{},express.json(),pki_path)
 let service=new BallotProviderService(channel, new SQLLiteDataService());
 service.run();
}


