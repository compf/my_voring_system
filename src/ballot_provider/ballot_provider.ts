import express from "express";
import https from "https";
import fs, { readFileSync } from "fs";
import  sqlite3   from "sqlite3";
import crypto from "crypto";
import ejs from "ejs";

import { AuthorizationInformation } from "../common/authorization_information";
import { BallotRequest } from "../common/ballot_request";
import { Ballot } from "../common/ballot";
import { time } from "console";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsServerChannel } from "../util/https_channel";
class BallotProviderService implements DistributedServerService{
  channel: CommunicationChannel;
  private db:any;
   isValidBallotRequest(row:any):boolean{
    const issuedCountStatement=this.db.prepare("SELECT COUNT(uuid) FROM BallotsIssued WHERE uuid=?",row.id);
    let cnt=(issuedCountStatement.get() as any).count
    console.log(cnt)
    if(cnt>0){
      return false;
    }
    return true;
  }
  run(): void {
    let db=this.db;
    let channel=this.channel;
    let isValidBallotRequest=this.isValidBallotRequest;
    this.channel.registerEvent("/getBallot",HttpMethod.Post, function (request, response) {
      console.log("request")
      const body=request.body as BallotRequest ;
      console.log(body);
      var stmt=db.prepare("SELECT * FROM BallotAuthorization ");
      stmt.each((err:any,row:any)=>{
        console.log("both",body.uuid+row.salt)
        const compareHash=crypto.createHash("sha256").update(body.uuid+row.salt).digest("base64");
    
        console.log("hash",row.id,compareHash);
        console.log()
        const timeDiff=body.time-row.time;
       // console.log(compareHash);
        if(compareHash==row.id && isValidBallotRequest(row)){
          console.log("compared")
          var insertIssuedStatement=db.prepare("INSERT INTO BallotsIssued VALUES(?,?) ",compareHash,new Date().getTime());
          //insertIssuedStatement.run();
          let ballot=JSON.parse(readFileSync(__dirname+"/ballot_templates/bundestag.json",{encoding:"utf-8"})) ;
          ballot.uuid=body.uuid;
          for(let v of ballot.groups[0].choices){
            console.log(v);
          }
         // console.log(ballot.groups[0].choices);
          ejs.renderFile(__dirname+"/ballot_templates/html_template.ejs", {ballot}, function(err, str){
            console.log(str,err);
            channel.send(str,response);
            
            channel.end(response)
          });
         
    
        }
      });
      stmt.finalize();
    });}
  constructor(channel:CommunicationChannel){
    this.channel=channel;
   this.db = new sqlite3.Database('database/database.db');
  }
}
if(require.main){
  const pki_path=__dirname+"/pki/"
  const BALLOT_PROVIDER_PORT=3001;
  let channel=new HttpsServerChannel(BALLOT_PROVIDER_PORT,  fs.readFileSync(pki_path+"ballot_provider.key.pem",{encoding:"utf-8"}),
 fs.readFileSync(pki_path+"ballot_provider.cert.pem",{encoding:"utf-8"}),false);
 let service=new BallotProviderService(channel);
 service.run();
}


