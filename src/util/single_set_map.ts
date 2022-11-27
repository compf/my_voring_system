export class SingleSetMap<T> extends Map<string, T> {
  set(key: string, value: T): this {
    if(this.has(key)){
        throw Error("Could not reset " +key+ " as it has already a value");
    }
    return super.set(key,value);
  }
}
