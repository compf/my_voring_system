import express from "express";
import https from "https";
import fs from "fs";
import crypto from "crypto";

import { AuthorizationInformation } from "../model/authorization_information";
import { HttpsServerChannel } from "../util/https_channel";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { DataService } from "../util/data_service";
import { SQLLiteDataService } from "../util/sqlite_data_service";
import { argv } from "process";
import {Constants} from "../model/constants"
export class BallotAuthorizationService implements DistributedServerService{
  channel: CommunicationChannel;
  dataService:DataService;
  run(): void {
    let service=this.dataService;

      this.channel.registerEvent(Constants.EVENT_NEW_VOTE_AUTHORIZATION,HttpMethod.Post,function (request,response){
          const body = request.body as AuthorizationInformation;
          const salt = crypto.randomUUID();
          let hash = crypto.createHash("sha256").update(body.uuid + salt).digest("base64");
          service.insert(Constants.TABLE_BALLOT_AUTHORIZATION,{"id":hash, "provider_id":body.provider_id, "time":body.time, "election":body.election, "salt":salt});
        });
  }
  constructor(channel:CommunicationChannel,dataService:DataService){
    this.channel=channel;
    this.dataService=dataService;
  }
}
if (require.main==module) {
  const pki_path=__dirname+"/pki/"

  let channel=HttpsServerChannel.fromJSON("conf/ballot_authorization_provider.json",{},express.json(),pki_path);
  let service=new BallotAuthorizationService(channel,new SQLLiteDataService());
  service.run();
  console.log("Started ballot auth")


}