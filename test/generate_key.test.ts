import { KeyProviderService } from "../src/vote_authorization_provider/vote_authorization_provider";
import { MemoryDatabaseService } from "./util/memory_database";
import { create_ballot_authorization, create_memory_db, request_ballot } from "./util/pipeline";
import { SimpleQueueChannel } from "./util/simple__queue_channel";


class StubKeyProviderService extends KeyProviderService{
  createAuthorization(): string {
      return JSON.stringify({body:super.createAuthorization()})
  }
}
test("test key generation",()=>{
    let db=create_memory_db();
    create_ballot_authorization(db)
    expect(db.count("BallotAuthorization",(x)=>true)).toBe(1);

});
test("test ballot receiving",()=>{
    let db=create_memory_db();
    create_ballot_authorization(db)
    let called=false;
    const callback=(a:any,b:any)=>{
       called=true;
    }
    request_ballot(db,callback);
    expect(called).toBeTruthy();

})