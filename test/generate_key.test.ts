import { AbstractVote } from "../src/model/abstract_vote";
import { Ballot } from "../src/model/ballot";
import { BooleanVote } from "../src/model/boolean_vote";
import { VoteCounter } from "../src/model/vote_counter";
import { SingleSetMap } from "../src/util/single_set_map";
import { VoteAuthorizationService } from "../src/vote_authorization_provider/vote_authorization_provider";
import { MemoryDatabaseService } from "./util/memory_database";
import { count_ballot, create_ballot_authorization, create_memory_db, request_ballot } from "./util/pipeline";
import { SimpleQueueChannel } from "./util/simple__queue_channel";



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
test("test ballot counting",()=>{
    let db=create_memory_db();
    create_ballot_authorization(db)
    let ballot:any={}
    const callbackVoting=(a:any,b:any)=>{
       ballot=JSON.parse(a);
    }
    request_ballot(db,callbackVoting);
    ballot.groups[0].votes=new Map();
   ballot.groups[0].votes["SPD"]=true
   let counter:{counter:VoteCounter}={counter:null!!};
   const callbackCounting=(a:any,b:any)=>{
        expect(counter.counter.getCount("ErstimmeSPD")).toBe(1)
   }
   count_ballot(db,{body:{ballot:JSON.stringify(ballot)}},counter,callbackCounting)

});