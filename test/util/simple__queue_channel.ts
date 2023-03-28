import { CommunicationChannel, HttpMethod } from "../../src/util/communication_channel";

export class SimpleQueueChannel implements CommunicationChannel{
    private channelQueue:string[];
    private eventDict:Map<string,(a:any,b:any)=>void> =new Map();
    send(message: string, over: any): void {
        let next=this.channelQueue.shift()!;
        this.eventDict.get(next)!(JSON.parse(message),null);
    }
    registerEvent(channel: string, method: HttpMethod, callback: (a: any,b:any) => void): void {
        this.eventDict.set(channel,callback);
    }
    constructor(channelQueue:string[]){
        this.channelQueue=channelQueue;
    }
    end(over: any): void {
        
    }
    
}