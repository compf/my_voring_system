export enum HttpMethod{
    Get,Post
}
export interface CommunicationChannel{
    end(over:any):void;
    send(message:string,over:any):void;
    registerEvent(channel:string,method:HttpMethod,callback:((a:any,b:any) => void)):void;
}
