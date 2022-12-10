import { response } from "express";
import crypto from "crypto";
import { AuthorizationInformation } from "../common/authorization_information";
import { BallotRequest } from "../common/ballot_request";
import { IncomingMessage, ServerResponse } from "http";
import { Http2SecureServer } from "http2";
import fs from "fs";
import https from "https";
import http from "http";
const message = { msg: "Hello!" };
const my_provider_id="42e521a4-6c41-4024-912e-cd3d19931b83";
const req = https.request(
  {
    host: "ballotprovider.compf.me",
    origin:"keyprovider.compf.me",
    port: 3001,
    secureProtocol: "TLSv1_2_method",
    path: "/getBallot",
    method: "POST",
    ca: 
    fs.readFileSync(`pki/my_ca-crt.pem`),
    headers: {
      "Content-Type": "application/json",
    
    }
  }) as http.ClientRequest;
let uuid= "9ce861dc-31d2-4376-9088-c5786f38aa96"
const body:BallotRequest={time:Date.now(),uuid:uuid}
console.log(body);
req.write(JSON.stringify(body));
req.on("response",(resp)=>{
    resp.on("data",(full:Buffer)=>{
        console.log(full.toString("utf8"))
    });
    });
req.end();


