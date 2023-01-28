import {UserSimpleIdT} from "../repository/types";

declare global {
    declare namespace Express {
        export interface Request {
            user:UserSimpleIdT|null
        }
    }
}
type StatusMessage<T> = {status: "Success", body:T};
type ErrorMessage ={message:string,field:string}