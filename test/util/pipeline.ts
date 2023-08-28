import { BallotAuthorizationService } from "../../src/ballot_provider/ballot_authorization_receiver";
import { BallotProviderService } from "../../src/ballot_provider/ballot_provider";
import { BallotRequesterService } from "../../src/ballot_requester";
import { VoteAuthorizationService } from "../../src/vote_authorization_provider/vote_authorization_provider";
import { CommunicationChannel, HttpMethod } from "../../src/util/communication_channel";
import { DataService } from "../../src/util/data_service";
import { MemoryDatabaseService } from "./memory_database";
import { IdentityParser, JSONParser, SimpleQueueChannel } from "./simple__queue_channel";
import { BallotCollectorService } from "../../src/ballot_collector/ballot_collector";
import { VoteCounter } from "../../src/model/vote_counter";

function getNewUid(): string {
    return  "a91b973f-5a8e-4957-a31b-15521bc8d1b2";
}
class StubVoteAuthorizationService extends VoteAuthorizationService{
  createAuthorization(): string {
   
      return JSON.stringify({body:JSON.parse(super.createAuthorization())})
  }
  getNewUid(): string {
      return getNewUid();
  }
}
class StubBallotProviderService extends BallotProviderService{
    sendBallot(ballot: string, responseObject: any): void {
        this.channel.send("",responseObject);
        this.channel.send(JSON.stringify(ballot),responseObject);
    }
}
class StubBallotRequesterService extends BallotRequesterService{
    createBody():any{
        return { body:{time: Date.now(), uuid: this.getUUID() }}
      }
      constructor(channel:CommunicationChannel){
        super(getNewUid(),channel)
      }
      processData(fullData: string): void {
        this.channel.send(fullData,null);

      }
}

export function get_example_provider_id():string{
    return "42e521a4-6c41-4024-912e-cd3d19931b83";
}
function get_table_names():string[]{
    return ["BallotAuthorization","BallotsIssued"]
}
export function create_memory_db():MemoryDatabaseService{
    return new MemoryDatabaseService(get_table_names())
}

export function get_example_election():string{
    return "btw2021";
}
export function create_ballot_authorization(db:DataService){
    const my_provider_id=get_example_provider_id();
    const election=get_example_election();
    let channel=new SimpleQueueChannel(["/newUUID"],[new JSONParser()])
    let ballotDbService=new BallotAuthorizationService(channel,db)
    ballotDbService.run();
    let keyProviderService=new StubVoteAuthorizationService(channel,my_provider_id,election);
    keyProviderService.run();
}
export function request_ballot(db:DataService,callback:(a:any,b:any)=>void){
    let jsonParser=new JSONParser();
    let identityParser=new IdentityParser();
    let channel=new SimpleQueueChannel(["/getBallot","response","data","data2"],[jsonParser,identityParser,identityParser,identityParser ])
    
    let requester=new StubBallotRequesterService(channel)
    let ballot_provider=new StubBallotProviderService(channel,db);
    channel.registerEvent("data2",HttpMethod.Get,callback)
    ballot_provider.run()
    requester.run();
}
export function count_ballot(db:DataService,ballot:any,counterHolder:{counter:VoteCounter},responseCallback:(a:any,b:any)=>void){
    let jsonParser=new JSONParser();
    let identityParser=new IdentityParser();

    let channel=new SimpleQueueChannel(["/submitBallot","response"],[jsonParser,identityParser])
    channel.registerEvent("response",HttpMethod.Get,responseCallback)
    let collector=new BallotCollectorService(channel,db,"",0,0)
    counterHolder.counter=collector.counter
    expect(collector.counter.applyInternJSON)
    collector.run()
    channel.send(JSON.stringify(ballot),undefined)
   

}

