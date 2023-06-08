import { response } from "express";
import crypto from "crypto";
import { AuthorizationInformation } from "../common/authorization_information";
import { BallotRequest } from "../common/ballot_request";
import { IncomingMessage, ServerResponse } from "http";
import { Http2SecureServer } from "http2";
import fs, { readFileSync, writeFileSync, writeSync } from "fs";
import https from "https";
import http from "http";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsClientChannel } from "../util/https_channel";
const my_provider_id = "42e521a4-6c41-4024-912e-cd3d19931b83";
const exec = require('child_process').exec;
export class BallotRequesterService implements DistributedServerService {
  channel: CommunicationChannel;
  uuid:string  = "a91b973f-5a8e-4957-a31b-15521bc8d1b2"
  processData(fullData:string){
    writeFileSync("temp.html", fullData);
  }
  createBody(uuid:string):any{
    return { time: Date.now(), uuid: uuid }
  }
  run(): void {
   
    const body=this.createBody(this.uuid)
    this.channel.registerEvent("response",HttpMethod.Get, (resp,a) => {
      this.channel.registerEvent("data",HttpMethod.Get, (full: Buffer) => {
        let fullData = full.toString();
        this.processData(fullData)
      });
    });
    console.log(body);
    this.channel.send(JSON.stringify(body),null);
   
    this.channel.end(null);
  }
  constructor(uuid:string,channel: CommunicationChannel) {
    this.channel = channel;
    this.uuid=uuid;
  }
  getUUID():string{
    return this.uuid;
  }

}
if(require.main==module){
  const BALLOT_PROVIDER_PORT=1998
  let args:any={}
  const uuid=readFileSync("lastUUID").toString();
  let channel=HttpsClientChannel.fromJSON("conf/ballot_requester.json",args,"/getBallot",HttpMethod.Post,"")
  let service=new BallotRequesterService(uuid,channel);
  service.run();
}
const message = { msg: "Hello!" };





