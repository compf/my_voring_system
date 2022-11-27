import { BallotGroup } from "./ballot_group";

export class Ballot{
    public readonly title:string;
    public readonly uuid:string;
    public readonly authorityId:string;
    public readonly issueTime:Date;
    public readonly groups:BallotGroup[];
    constructor(title:string,uuid:string,authorityId:string,issueTime:Date,groups:BallotGroup[]){
        this.title=title;
        this.uuid=uuid;
        this.issueTime=issueTime;
        this.authorityId=authorityId;
        this.groups=groups;
    }
    
}
export function fromJSON(jsonText:string,template:boolean){
    const json=JSON.parse(jsonText);
    let groups:BallotGroup[]=[]
    for(let g of json["groups"]){
        groups.push(new BallotGroup(g["title"],new Set(g["choices"]),g["type"],template?null:g["votes"]));
    }
    return new Ballot(json["title"],json["uuid"],json["authorityId"],  new Date(json["issueTime"]),groups);

}
export function toJSON(ballot:Ballot,template:boolean){
    const json={
        "title":ballot.title,
        "uuid":ballot.uuid,
        "template":template,
        "authorityId":ballot.authorityId,
        "issueTime":ballot.issueTime.getTime(),
       "groups":[]
    } as any;
    let groups:BallotGroup[]=[]
    for(let g of ballot.groups){
        json["groups"]["title"]=g.title;
        json["groups"]["choices"]=g.choices;
        if(!template)
            json["groups"]["votes"]=g.votes;

    }
    return  json;

}
