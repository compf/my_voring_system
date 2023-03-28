import { response } from "express";
import crypto, { checkPrime } from "crypto";
import { AuthorizationInformation } from "../common/authorization_information";
import fs from "fs";
import https from "https";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsClientChannel } from "../util/https_channel";
import { DistributedServerService } from "../util/distributed_server_service";
export class KeyProviderService implements DistributedServerService{
  private channel:CommunicationChannel;
  private provider_id:string;
  private election:string;
  constructor(communicationChannel:CommunicationChannel,provider_id:string,election:string){
      this.channel=communicationChannel;
      this.election=election;
      this.provider_id=provider_id;
  }
  getNewUid():string{
    return crypto.randomUUID();
  }
  end(){
    this.channel.end(null);
  }
  sendAuthorizationInformation(msg:string):void{
    this.channel.send(msg,null)
  }
  createAuthorization():string{
    const body:AuthorizationInformation={time:Date.now(),uuid:this.getNewUid(),provider_id:this.provider_id,election:this.election}
    return (JSON.stringify(body));
  }
  run(){
    this.sendAuthorizationInformation(this.createAuthorization());
  }
}
const my_provider_id="42e521a4-6c41-4024-912e-cd3d19931b83";
if(require.main==module){
  const source="keyprovider.compf.me";
  const dest="ballotprovider.compf.me";
  const destPort=3000;
  const pr_key_path=`${__dirname}/pki/key_provider.key.pem`;
  const pub_key_path=`${__dirname}/pki/key_provider.crt.pem`;
  const channel="/newUUID";
  const method=HttpMethod.Post;
  const election="btw2021";
  let service=new KeyProviderService(new HttpsClientChannel(source,dest,destPort,pr_key_path,pub_key_path,channel,method),my_provider_id,election)
  service.run()
}
