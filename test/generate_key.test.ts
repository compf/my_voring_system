import { BallotAuthoizationService } from "../src/ballot_provider/ballot_db";
import { KeyProviderService } from "../src/key_provider/key_provider";
import { MemoryDatabaseService } from "./util/memory_database";
import { SimpleQueueChannel } from "./util/simple__queue_channel";

test("initial test",()=>{
    expect(5).toBe(5);
})
class StubKeyProviderService extends KeyProviderService{
  createAuthorization(): string {
      return JSON.stringify({body:super.createAuthorization()})
  }
}
test("test key generation",()=>{
    const my_provider_id="42e521a4-6c41-4024-912e-cd3d19931b83";
    const election="btw2021";
    let memoryDb=new MemoryDatabaseService(["BallotAuthorization","BallotsIssued"])
    let channel=new SimpleQueueChannel(["/newUUID"])
    let ballotDbService=new BallotAuthoizationService(channel,memoryDb)
    ballotDbService.run();
    let keyProviderService=new StubKeyProviderService(channel,my_provider_id,election);
    keyProviderService.run();
    expect(memoryDb.count("BallotAuthorization",(x)=>true)).toBe(1);
})