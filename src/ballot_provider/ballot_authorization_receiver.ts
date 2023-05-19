import express from "express";
import https from "https";
import fs from "fs";
import crypto from "crypto";

import { AuthorizationInformation } from "../common/authorization_information";
import { HttpsServerChannel } from "../util/https_channel";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { DataService } from "../util/data_service";
import { SQLLiteDataService } from "../util/sqlite_data_service";
export class BallotAuthorizationService implements DistributedServerService{
  channel: CommunicationChannel;
  dataService:DataService;
  run(): void {
    let service=this.dataService;
    console.log("service")

      this.channel.registerEvent("/newUUID",HttpMethod.Post,function (request,response){
          const body = request.body as AuthorizationInformation;
          const salt = crypto.randomUUID();
          console.log(body.uuid, salt);
          console.log(body.uuid + salt);
          let hash = crypto.createHash("sha256").update(body.uuid + salt).digest("base64");
          console.log("hash", hash);
          service.insert("BallotAuthorization",{"id":hash, "provider_id":body.provider_id, "time":body.time, "election":body.election, "salt":salt});
          console.log("Received");
        });
  }
  constructor(channel:CommunicationChannel,dataService:DataService){
    this.channel=channel;
    this.dataService=dataService;
  }
}
if (require.main==module) {
  const pki_path = __dirname + "/pki/"
  const PORT=1997;
  let channel=new HttpsServerChannel(PORT,pki_path + "ballot_provider.key.pem",pki_path + "ballot_provider.cert.pem",true);
  let service=new BallotAuthorizationService(channel,new SQLLiteDataService());
  service.run();
  console.log("Started ballot auth")


}