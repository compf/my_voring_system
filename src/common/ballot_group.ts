import { SingleSetMap } from "../util/single_set_map";
import { AbstractVote } from "./abstract_vote";
import { BooleanVote } from "./boolean_vote";

export class BallotGroup{
    public readonly votes:SingleSetMap<AbstractVote>;
    public readonly choices:Set<string>;
    public readonly title:string;
    constructor(title:string,choices:Set<string>,type:string,votes:Map<string,any>|null){
        this.votes=new SingleSetMap<AbstractVote>();
        this.choices=choices;
        this.title=title;
        if(votes!=null){
            for(let v of Object.keys(votes)){
                if(type=="boolean"){
                    this.votes.set(v, new BooleanVote( v,votes.get(v)));
                }
                
            }
        }
    }
}