import { AbstractVote } from "./abstract_vote";

export class BooleanVote extends AbstractVote{
    public  readonly key:string;
    private readonly vote:boolean=false;
    getKey(): string {
        return this.key;
    }
    isValid(): boolean {
        return (this.vote || !this.vote) && this.vote!=null && this.vote!=undefined;
    }
    public getVote(){
        return this.vote;
    }
    constructor(key:string,vote:boolean){
        super();
        this.key=key;
        this.vote=vote;
    }

}