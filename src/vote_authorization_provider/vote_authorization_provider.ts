import { response } from "express";
import crypto, { checkPrime } from "crypto";
import { AuthorizationInformation } from "../model/authorization_information";
import fs, { writeFileSync } from "fs";
import https from "https";
import { CommunicationChannel, HttpMethod } from "../util/communication_channel";
import { HttpsClientChannel } from "../util/https_channel";
import { DistributedServerService } from "../util/distributed_server_service";
import { Constants } from "../model/constants";
export class VoteAuthorizationService implements DistributedServerService{
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
    this.channel.end(null);
  }
  createAuthorization():string{
    let uuid=this.getNewUid()
    writeFileSync("lastUUID",uuid)
    const body:AuthorizationInformation={time:Date.now(),uuid:uuid,provider_id:this.provider_id,election:this.election}
    return (JSON.stringify(body));
  }
  run(){
    this.sendAuthorizationInformation(this.createAuthorization());
  }
}
const my_provider_id="42e521a4-6c41-4024-912e-cd3d19931b83";
if(require.main==module){

  const pki_path=__dirname+"/pki/"

  const channelName=Constants.EVENT_NEW_VOTE_AUTHORIZATION;
  const method=HttpMethod.Post;
  let args:any={}
  const channel=HttpsClientChannel.fromJSON("conf/vote_authorization_provider.json",args,channelName,method,pki_path);
  let service=new VoteAuthorizationService(channel,args.provider_id,args.election)

  service.run();

}
