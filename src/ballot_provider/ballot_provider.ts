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
const app = express();
app.use(express.json());
console.log(__dirname+'/database.db');
const db = new sqlite3.Database('database/database.db');
const BALLOT_PROVIDER_PORT=3001;

app.post("/getBallot", function (request, response) {
  console.log("request")
  const body=request.body as BallotRequest ;
  console.log(body);
  var stmt=db.prepare("SELECT * FROM BallotAuthorization ");
  stmt.each((err,row)=>{
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
      let ballot=JSON.parse(readFileSync(__dirname+"/ballot_templates/bundestag.json",{encoding:"utf-8"})) as Ballot;
      for(let v of ballot.groups[0].choices){
        console.log(v);
      }
     // console.log(ballot.groups[0].choices);
      ejs.renderFile(__dirname+"/ballot_templates/html_template.ejs", {ballot}, function(err, str){
        console.log(str,err);
        response.send(str);
        
        response.end()
      });
     

    }
  });
  stmt.finalize()
});
function isValidBallotRequest(row:any):boolean{
  const issuedCountStatement=db.prepare("SELECT COUNT(uuid) FROM BallotsIssued WHERE uuid=?",row.id);
  let cnt=(issuedCountStatement.get() as any).count
  console.log(cnt)
  if(cnt>0){
    return false;
  }
  return true;
}

const pki_path=__dirname+"/pki/"
https
  .createServer(
    {
      key: fs.readFileSync(pki_path+"ballot_provider.key.pem"),
      cert: fs.readFileSync(pki_path+"ballot_provider.cert.pem"),
      
      requestCert: false,
      ca: 
        fs.readFileSync(`pki/my_ca-crt.pem`),
    },
    app
  )
  .listen(BALLOT_PROVIDER_PORT, function () {
    console.log(
      "Example app listening on port 3001! Go to https://localhost:3000/"
    );
  });
