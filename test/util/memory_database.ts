import { DataService } from "../../src/util/data_service";
class Table{
    public rows:{[index: string]: string}[]=[]
}
export class MemoryDatabaseService implements DataService{
    private tables:Map<string,Table>=new Map();
    query(tableName: string, each: (row: { [index: string]: string; }) => void, predicate: (row: { [index: string]: string; }) => boolean): void {
        let tbl=this.tables.get(tableName);
        for(let r of tbl!.rows){
            if(predicate(r)){
                each(r);
            }
        }
    }
    count(tableName: string, predicate: (row: { [index: string]: string; }) => boolean): number {
        let tbl=this.tables.get(tableName);
        let counter=0;
        for(let r of tbl!.rows){
            if(predicate(r)){
                counter++;
            }
        }
        return counter;
    }
    insert(tableName: string, row: { [index: string]: string; }): void {
        this.tables.get(tableName)!.rows.push(row);
    }
    queryAll(tableName: string): IterableIterator<{ [index: string]: string; }> {
        return this.tables.get(tableName)!.rows.values();
    }
    constructor(tables:string[]){
        for(let s of tables){
            this.tables.set(s,new Table());
        }
    }
    
}