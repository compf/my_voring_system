import express from "express";
import https from "https";
import fs, { readFileSync } from "fs";
const db = require('better-sqlite3')('database/database.db');
import crypto from "crypto";
import ejs from "ejs";
let finnished={finnished:false};
import { AuthorizationInformation } from "../common/authorization_information";
import { BallotRequest } from "../common/ballot_request";
import { Ballot, fromJSON } from "../common/ballot";
import { time } from "console";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { DataService } from "../util/data_service";
import { HttpsServerChannel } from "../util/https_channel";
import { SQLLiteDataService } from "../util/sqlite_data_service";
const app = express();
app.use(express.urlencoded({extended: true}));
console.log(__dirname+'/database.db');
const BALLOT_COLLECTOR_PORT=3002;
export class BallotCollectorService implements DistributedServerService{
  channel:CommunicationChannel;
  dataService:DataService;
   isValidBallotRequest(row:any):boolean{
    const issuedCountStatement=db.prepare("SELECT COUNT(uuid) FROM BallotsIssued WHERE uuid=?",row.id);
    let cnt=(issuedCountStatement.get(0) as any).count
    console.log(cnt)
    if(cnt>0){
      return false;
    }
    return true;
  }
  run(): void {
    const isValidBallotRequest=this.isValidBallotRequest;
    this.channel.registerEvent("/submitBallot",HttpMethod.Post, function (request, response) {
      console.log("request",request.body);
      const b=(request.body["ballot"]);
      const body=fromJSON(b,false);
      console.log(body);
      
      var stmt=db.prepare("SELECT * FROM BallotAuthorization ");
       for( let row of stmt.iterate()){
        if(finnished.finnished){
          return false;
        }
        console.log("both",body.uuid+row.salt)
        const compareHash=crypto.createHash("sha256").update(body.uuid+row.salt).digest("base64");
    
        console.log("hash",row.id,compareHash);
        console.log()
        const timeDiff=body.issueTime.getTime()-row.time;
       // console.log(compareHash);
        if(compareHash==row.id &&  isValidBallotRequest(row)){
         
          response.write("Successful");
          response.end();
          console.log("compared")
          finnished.finnished=true;
          console.log("we",finnished.finnished)
          
      
         
    
        }
      };
      console.log("finn",finnished.finnished)
      if(!finnished.finnished){
        console.log("cool");
        response.send("NOT SUCCESSFUL");
        response.end();
      }
    
     
    });
  }
  constructor(channel:CommunicationChannel,dataService:DataService){
    this.channel=channel;
    this.dataService=dataService;
  }

}


if(require.main){
  const pki_path=__dirname+"/pki/"
  let channel=new HttpsServerChannel(BALLOT_COLLECTOR_PORT,pki_path+"ballot_collector.key.pem",pki_path+"ballot_collector.cert.pem",false);
  let dataService=new SQLLiteDataService();
  let service=new BallotCollectorService(channel,dataService);
  service.run();
}


