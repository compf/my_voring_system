const fs = require("fs");
const https = require("https");
const message = { msg: "Hello!" };

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
    path: "/",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(message))
    }
  });
  
req.write(JSON.stringify(message));