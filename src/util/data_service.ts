export interface DataService{
    query(tableName:string,each:(row: {[index:string] : string}) => void,predicate:(row:{[index:string] : string}) =>boolean):void;
     count(tableName:string,predicate:( row: {[index:string] : string}) =>boolean):number;
    insert(tableName:string, row: {[index:string] : string}):void;
    queryAll(tableName:string):IterableIterator<{ [index: string]: string; }>;

}