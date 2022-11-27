import { response } from "express";
import crypto from "crypto";
import { AuthorizationInformation } from "../common/AuthorizationInformation";
const fs = require("fs");
const https = require("https");
const message = { msg: "Hello!" };
const my_provider_id="42e521a4-6c41-4024-912e-cd3d19931b83";
const req = https.request(
  {
    host: "ballotprovider.compf.me",
    origin:"keyprovider.compf.me",
    port: 3000,
    secureProtocol: "TLSv1_2_method",
    key: fs.readFileSync(`${__dirname}/pki/key_provider.key.pem`),
    cert: fs.readFileSync(`${__dirname}/pki/key_provider.crt.pem`),
    ca: 
      fs.readFileSync(`pki/my_ca-crt.pem`)
    ,
    path: "/newUUID",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    
    }
  });
let uuid= crypto.randomUUID()
const body:AuthorizationInformation={time:Date.now(),uuid:uuid,provider_id:my_provider_id,election:"btw2021"}
console.log(uuid);
req.write(JSON.stringify(body));
req.end()