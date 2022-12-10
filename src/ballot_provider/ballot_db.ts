import express from "express";
import https from "https";
import fs from "fs";
import  sqlite3   from "sqlite3";
import crypto from "crypto";

import { AuthorizationInformation } from "../common/authorization_information";
const app = express();
app.use(express.json());
console.log(__dirname+'/database.db');
const db = new sqlite3.Database('database/database.db');
app.post("/newUUID", function (request, response) {
  const body=request.body as AuthorizationInformation;
  const salt=crypto.randomUUID();
  console.log(body.uuid,salt);
  console.log(body.uuid+salt);
 let hash=  crypto.createHash("sha256").update(body.uuid+salt).digest("base64");
 console.log("hash",hash);
  var stmt=db.prepare("INSERT INTO BallotAuthorization VALUES(?,?,?,?,?)");
  stmt.run(hash,body.provider_id,body.time,body.election,salt);
  stmt.finalize();
  console.log("Received");
});

app.get("/",function(request,response){
    response.send("Hello world");
    console.log("hallo")
});
const pki_path=__dirname+"/pki/"
https
  .createServer(
    {
      key: fs.readFileSync(pki_path+"ballot_provider.key.pem"),
      cert: fs.readFileSync(pki_path+"ballot_provider.cert.pem"),
      
      requestCert: true,
      ca: 
        fs.readFileSync(`pki/my_ca-crt.pem`),
    },
    app
  )
  .listen(3000, function () {
    console.log(
      "Example app listening on port 3000! Go to https://localhost:3000/"
    );
  });
