import { response } from "express";
import crypto from "crypto";
import { AuthorizationInformation } from "../common/authorization_information";
import { BallotRequest } from "../common/ballot_request";
import { IncomingMessage, ServerResponse } from "http";
import { Http2SecureServer } from "http2";
import fs, { writeFileSync, writeSync } from "fs";
import https from "https";
import http from "http";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsClientChannel } from "../util/https_channel";
const my_provider_id = "42e521a4-6c41-4024-912e-cd3d19931b83";
const exec = require('child_process').exec;
export class BallotRequesterService implements DistributedServerService {
  channel: CommunicationChannel;
  run(): void {
    let uuid = "a91b973f-5a8e-4957-a31b-15521bc8d1b2"
    const body: BallotRequest = { time: Date.now(), uuid: uuid }
    console.log(body);
    this.channel.send(JSON.stringify(body),null);
    this.channel.registerEvent("response",HttpMethod.Get, (resp,a) => {
      this.channel.registerEvent("data",HttpMethod.Get, (full: Buffer) => {
        let fullData = full.toString();
        writeFileSync("temp.html", fullData);
        exec("firefox temp.html")
        console.log(full.toString("utf8"))
      });
    });
    this.channel.end(null);
  }
  constructor(channel: CommunicationChannel) {
    this.channel = channel;
  }

}
if(require.main){
  const BALLOT_PROVIDER_PORT=3001
  let channel=new HttpsClientChannel("", "ballotprovider.compf.me",BALLOT_PROVIDER_PORT,"/dev/null","/dev/null","/getBallot",HttpMethod.Post);
  let service=new BallotRequesterService(channel);
  service.run();
}
const message = { msg: "Hello!" };





