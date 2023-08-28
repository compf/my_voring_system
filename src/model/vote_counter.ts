export class VoteCounter{
    private intern:{[key:string]:number}={}
    applyInternJSON(internJSON:{[key:string]:number}){
        for(var key of Object.keys(internJSON)){
            this.intern[key]+=internJSON[key]
        }
    }
    getCount(key:string):number{
        return this.intern[key]
    }
    count(key:string,value:number|boolean){
        if (typeof(value)==="boolean"){
            this.count(key,1)
        }
        else{
            if (key in this.intern){
                this.intern[key]+=1
            }
            else{
                this.intern[key]=value
            }
        }
    }
}