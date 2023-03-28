export interface DataService{
    query(tableName:string,each:(row: {[index:string] : any}) => void,predicate:(row:{[index:string] : any}) =>boolean):void;
     count(tableName:string,predicate:( row: {[index:string] : any}) =>boolean):number;
    insert(tableName:string, row: {[index:string] : any}):void;
    queryAll(tableName:string):IterableIterator<{ [index: string]: any; }>;

}