import {UserSimpleIdT} from "../repository/types";

declare global {
    declare namespace Express {
        export interface Request {
            user:UserSimpleIdT|null
        }
    }
}