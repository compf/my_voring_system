import express from "express";
import https from "https";
import fs from "fs";
const app = express();
app.post("addAuthen", function (request, response) {
  console.log(request.body);
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
      
      requestCert: false,
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
