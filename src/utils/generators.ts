import {Response} from "express";
import {ErrorMessage} from "../types/types";

export type BodyForMessageT = {message:string, field:string}

export type MessageForResT<T> = {
    code:number, body?:T[]
}

type MessageWithResT<T> = {res:Response} & MessageForResT<T>

export const generators = {
    messageRes( msg: MessageWithResT<BodyForMessageT>):void {
        const {res, body, code} = msg;
        if (code >= 200 && code < 300) {
            res.sendStatus(code)
        } else if (code >= 400 && code < 500) {
           if (body) {res.status(code).send({errorsMessages: body})}
           else {res.sendStatus(code)}}
       }
}