import {AccessTokenT, RefreshTokenT, UserMongoIdT} from "../repository/types";
import jwt from "jsonwebtoken";
import {settings} from "./setting";
import {ObjectId} from "mongodb";
import {usersService} from "../domain/users-service";
import {authService} from "../domain/auth-service";

export const jwtService = {
    async createJWT(user:UserMongoIdT): Promise<AccessTokenT & RefreshTokenT> {
        const token = jwt.sign({user_id:user._id.toString()}, settings.JWT_SECRET, {expiresIn:10000})
        const refreshToken = jwt.sign({user_id:user._id.toString()}, settings.REFRESH_TOKEN_SECRET, {expiresIn:20000})
        return {accessToken:token,refreshToken:refreshToken}
    },
    async getUserIdByToken(token:string|undefined,secret?:string){
        try {
            if(!token) { return null}
            let result:any
            if(!secret){
                result = jwt.verify(token, settings.JWT_SECRET)
            } else {
                const checkBlackList = await authService.checkBlackList(token);
                console.log(checkBlackList);
                if(!checkBlackList){ return null}
                result = jwt.verify(token, settings.REFRESH_TOKEN_SECRET)
                const user = await usersService.getUserMongoById(result.user_id)
                if(!user || !result.user_id) {return null}
            }
            return result.user_id
        } catch (e) {
            console.error(e)
            return null;
        }
    }
}
