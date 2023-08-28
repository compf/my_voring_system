import { Validatable } from "../util/validatable";

export  abstract class AbstractVote implements Validatable{
    abstract getKey():string;
    abstract isValid():boolean;
}