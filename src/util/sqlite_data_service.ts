import { DataService } from "./data_service";
import Database from 'better-sqlite3';
export class SQLLiteDataService implements DataService{
    query(tableName: string, each: ( row: {[index:string] : string}) => void, predicate: ( row: {[index:string] : string}) => boolean): void {
       
        var stmt=this.db.prepare("SELECT * FROM "+tableName);
        for(let row of stmt.iterate()){
            if(predicate(row )){
                each(row as {[index:string] : string})
            }
        }
    }
    queryAll(tableName: string): IterableIterator<{ [index: string]: string; }> {
        var stmt=this.db.prepare("SELECT * FROM " +tableName);

        return (stmt.iterate());
    }
     count(tableName: string, predicate: ( row: {[index:string] : string}) => boolean): number {
        var stmt=this.db.prepare("SELECT * FROM  "+tableName);
        let counter=0;
        for(let row of stmt.iterate()){
            if(predicate(row )){
               counter++;
            }
        }
        return counter;
    }
    insert(tableName: string,  row: {[index:string] : string}): void {
        let args=[];
        for(let c of Object.keys(row)){
            args.push(row[c])
        }
        let valuesPart=tableName+" VALUES(";
        valuesPart+=args.map((c)=>"?").join(",");
        valuesPart+=")"
        console.log("values",valuesPart)
        var insertIssuedStatement=this.db.prepare("INSERT INTO "+valuesPart );
        insertIssuedStatement.run(args);
    }
    constructor(){
        this.db = new Database('database/database.db');
    }
    db:Database.Database;

}
