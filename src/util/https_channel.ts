import express from "express";
import https from "https";
import http from "http";
import fs, { readFileSync } from "fs";
import { CommunicationChannel, HttpMethod } from "./communication_channel";
export interface SSLKeyResolver{
    resolve(key:string|undefined):string|undefined;
}
export class FileBasedResolver implements SSLKeyResolver{
    pki_path: string;
    resolve(key: string|undefined): string|undefined {
        if(key==undefined)return undefined
       return readFileSync(this.pki_path+key).toString("utf-8")
    }
    constructor(pki_path:string){
        this.pki_path=pki_path
    }
    
}
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
    static fromJSON(conf:any,type:express.RequestHandler,key_resolver:SSLKeyResolver):HttpsServerChannel{
        let channel=new HttpsServerChannel(conf.src_port,key_resolver.resolve(conf.private_key),key_resolver.resolve(conf.public_key),key_resolver.resolve(conf.ca_public),conf.trusted_only,type);

        return channel
    }
    constructor(srcPort: number, private_key: string|undefined, public_key: string|undefined,ca:string|undefined, request_cert: boolean,type:express.RequestHandler) {
        console.log(arguments)

        this.app=express();
        this.app.use(type)
        console.log(arguments)
        https
            .createServer(
                {
                    key: private_key,
                    cert: public_key,

                    requestCert: request_cert,
                    ca:
                        ca
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
    static fromJSON(conf:any,key_resolver:SSLKeyResolver,channel:string,method:HttpMethod):HttpsClientChannel{
        let result=new HttpsClientChannel(conf.source,conf.dest,conf.dest_port,key_resolver.resolve(conf.private_key),key_resolver.resolve(conf.public_key),key_resolver.resolve(conf.ca_public),channel,method)
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
    constructor(source:string,dest:string,destPort:number, private_key: string|undefined, public_key: string|undefined,ca:string|undefined,channel:string,method:HttpMethod){
        
        console.log(arguments)

        this.request = https.request(
            {
              host: dest,
              origin:source,
              port: destPort,
              secureProtocol: "TLSv1_2_method",
              key:private_key,
              cert:public_key,
              ca: 
                ca
              ,
              path: channel,
              method: HttpMethod[ method].toUpperCase(),
              headers: {
                "Content-Type": "application/json",
              
              }
            });
    }

}