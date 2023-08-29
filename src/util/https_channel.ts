import express from "express";
import https from "https";
import http from "http";
import fs, { readFileSync } from "fs";
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
    static fromJSON(json_path:string,loaded_json:any,type:express.RequestHandler,pki_path:string):HttpsServerChannel{
        const conf=JSON.parse(readFileSync(json_path).toString())
        let channel=new HttpsServerChannel(conf.port,pki_path+conf.private_key_file_name,pki_path+conf.public_key_file_name,conf.trusted_only,type);
        for(let key of Object.keys(conf)){
            loaded_json[key]=conf[key]
        }
        return channel
    }
    constructor(srcPort: number, private_key_path: string, public_key_path: string, request_cert: boolean,type:express.RequestHandler) {
        this.app=express();
        this.app.use(type)
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
    static fromJSON(json_path:string,loaded_json:any,channel:string,method:HttpMethod,pki_path:string):HttpsClientChannel{
        const conf=JSON.parse(readFileSync(json_path).toString())
        let result=new HttpsClientChannel(conf.source,conf.dest,conf.port,pki_path+conf.private_key_path,pki_path+conf.public_key_path,channel,method)
        for(let key of Object.keys(conf)){
            loaded_json[key]=conf[key]
        }
        return result;
    }
    private request:http.ClientRequest;
    response?:http.ServerResponse;
    send(message: string,over:any): void {
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
    constructor(source:string,dest:string,destPort:number, private_key_path: string|undefined, public_key_path: string|undefined,channel:string,method:HttpMethod){
        this.request = https.request(
            {
              host: dest,
              origin:source,
              port: destPort,
              secureProtocol: "TLSv1_2_method",
              key: (private_key_path!=undefined && private_key_path!="undefined") ?fs.readFileSync(private_key_path):undefined,
              cert: (public_key_path!=undefined && public_key_path!="undefined") ? fs.readFileSync(public_key_path):undefined,
              ca: 
                fs.readFileSync(`pki/my_ca-crt.pem`)
              ,
              path: channel,
              method: HttpMethod[ method].toUpperCase(),
              headers: {
                "Content-Type": "application/json",
              
              }
            });
    }

}