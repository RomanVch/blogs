import {AccessTokenT, UserMongoIdT} from "../repository/types";
import jwt from "jsonwebtoken";
import {settings} from "./setting";
import {ObjectId} from "mongodb";

export const jwtService = {
    async createJWT(user:UserMongoIdT): Promise<AccessTokenT> {
        const token = jwt.sign({user_id:user._id.toString()}, settings.JWT_SECRET, {expiresIn:"1h"})
        return {accessToken:token}
    },
    async getUserIdByToken(token:string|undefined){
        try {
            if(!token) { return null}
            const result:any = jwt.verify(token, settings.JWT_SECRET)
                return new ObjectId(result.user_id)
        } catch (e) {
            return null;
        }
    }
}
