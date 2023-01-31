import {AccessTokenT, RefreshTokenT, UserMongoIdT} from "../repository/types";
import jwt from "jsonwebtoken";
import {settings} from "./setting";
import {ObjectId} from "mongodb";
import {usersService} from "../domain/users-service";

export const jwtService = {
    async createJWT(user:UserMongoIdT): Promise<AccessTokenT & RefreshTokenT> {
        const token = jwt.sign({user_id:user._id.toString()}, settings.JWT_SECRET, {expiresIn:"5m"})
        const refreshToken = jwt.sign({user_id:user._id.toString()}, settings.REFRESH_TOKEN_SECRET, {expiresIn:"1h"})
        return {accessToken:token,refreshToken:refreshToken}
    },
    async getUserIdByToken(token:string|undefined,secret?:string){
        try {
            if(!token) { return null}
            let result:any
            if(!secret){
                result = jwt.verify(token, settings.JWT_SECRET)
            } else {
                result = jwt.verify(token, settings.REFRESH_TOKEN_SECRET)
                const user = await usersService.getUserMongoById(result.user_id)
                if(!user) {return null}
                if(user.auth.refreshToken !== token) {return null}
                return new ObjectId(result.user_id)
            }
        } catch (e) {
            return null;
        }
    }
}
