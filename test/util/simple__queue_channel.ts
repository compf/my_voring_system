import { CommunicationChannel, HttpMethod } from "../../src/util/communication_channel";
export interface Parser{
   parse(input:string):any;
}
export class IdentityParser implements Parser{
    parse(input: string) {
        return input;
    }
}
export class JSONParser implements Parser{
    parse(input: string) {
        return JSON.parse(input);
    }
}
export class SimpleQueueChannel implements CommunicationChannel{
    private channelQueue:string[];
    private parserQueue:Parser[];
    private eventDict:Map<string,(a:any,b:any)=>void> =new Map();
    send(message: string, over: any): void {
        let next=this.channelQueue.shift()!;
        console.log("next channel",next)
        let parser=this.parserQueue.shift()!;
        this.eventDict.get(next)!(parser.parse(message),null);
    }
    registerEvent(channel: string, method: HttpMethod, callback: (a: any,b:any) => void): void {
        this.eventDict.set(channel,callback);
    }
    constructor(channelQueue:string[],parserQueue:Parser[]){
        this.channelQueue=channelQueue;
        this.parserQueue=parserQueue;
    }
    end(over: any): void {
        
    }
    
}