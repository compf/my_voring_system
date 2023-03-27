import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import { CommunicationChannel, HttpMethod } from "./communication_channel";
export class HttpsServerChannel implements CommunicationChannel {
    private app:express.Application;
    send(message: string,over:any): void {
        over.send(message)
    }
    end(over: any): void {
        over.end();
    }
    registerEvent(channel: string, method: HttpMethod, callback: (a: any,b:any) => void): void {
       if(method== HttpMethod.Get){
        this.app.get(channel,callback);
       }
       else if (method== HttpMethod.Post){
        this.app.post(channel,callback);
       }
    }
    constructor(srcPort: number, private_key_path: string, public_key_path: string, request_cert: boolean) {
        this.app=express();

        https
            .createServer(
                {
                    key: fs.readFileSync(private_key_path),
                    cert: fs.readFileSync(public_key_path),

                    requestCert: request_cert,
                    ca:
                        fs.readFileSync(`pki/my_ca-crt.pem`),
                },
                this.app
            )
            .listen(srcPort, function () {
                console.log(
                    "Started server on" + srcPort
                );
            });
    }
}
export class HttpsClientChannel implements CommunicationChannel{
    private request:http.ClientRequest;
    response?:http.ServerResponse;
    send(message: string,over:any): void {
        this.request.write(message);
    }
    end(over:any): void {
        this.request.end();
    }
    registerEvent(channel: string, method: HttpMethod, callback: (a: any,b:any) => void): void {
        if(channel=="response"){
            this.request.on(channel,callback);
        }
        else if (channel=="data"){
            // All data has been received
            this.response?.on(channel,callback);
        }
        this.request.on(channel,callback);
    }
    constructor(source:string,dest:string,destPort:number, private_key_path: string, public_key_path: string,channel:string,method:HttpMethod){
        this.request = https.request(
            {
              host: dest,
              origin:source,
              port: destPort,
              secureProtocol: "TLSv1_2_method",
              key: fs.readFileSync(private_key_path),
              cert: fs.readFileSync(public_key_path),
              ca: 
                fs.readFileSync(`pki/my_ca-crt.pem`)
              ,
              path: channel,
              method: method.toString().toUpperCase(),
              headers: {
                "Content-Type": "application/json",
              
              }
            });
    }

}