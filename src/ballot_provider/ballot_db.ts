import express from "express";
import https from "https";
import fs from "fs";
import sqlite3 from "sqlite3";
import crypto from "crypto";

import { AuthorizationInformation } from "../common/authorization_information";
import { HttpsServerChannel } from "../util/https_channel";
import { DistributedServerService } from "../util/distributed_server_service";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
class BallotAuthoizationService implements DistributedServerService{
  channel: CommunicationChannel;
  run(): void {
    const db = new sqlite3.Database('database/database.db');

      this.channel.registerEvent("/newUUID",HttpMethod.Post,function (request,response){
        
          const body = request.body as AuthorizationInformation;
          const salt = crypto.randomUUID();
          console.log(body.uuid, salt);
          console.log(body.uuid + salt);
          let hash = crypto.createHash("sha256").update(body.uuid + salt).digest("base64");
          console.log("hash", hash);
          var stmt = db.prepare("INSERT INTO BallotAuthorization VALUES(?,?,?,?,?)");
          stmt.run(hash, body.provider_id, body.time, body.election, salt);
          stmt.finalize();
          console.log("Received");
        });
  }
  constructor(channel:CommunicationChannel){
    this.channel=channel;
  }
}
if (require.main) {
  const pki_path = __dirname + "/pki/"
  const PORT=3000;
  let channel=new HttpsServerChannel(PORT,fs.readFileSync(pki_path + "ballot_provider.key.pem",{encoding:"utf-8"}),fs.readFileSync(pki_path + "ballot_provider.cert.pem",{encoding:"utf-8"}),true);

}