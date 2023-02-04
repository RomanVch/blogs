import {AccessTokenT, RefreshTokenT} from "../repository/types";
import jwt from "jsonwebtoken";
import {settings} from "./setting";
import {usersService} from "../domain/users-service";
import {authService} from "../domain/auth-service";
import {ObjectId} from "mongodb";

export const jwtService = {
    async createJWT(deviceId:string): Promise<AccessTokenT & RefreshTokenT> {
        const token = jwt.sign({deviceId}, settings.JWT_SECRET, {expiresIn:settings.TIME_LIFE_ACCESS_TOKEN})
        const refreshToken = jwt.sign({deviceId}, settings.REFRESH_TOKEN_SECRET, {expiresIn:settings.TIME_LIFE_REFRESH_TOKEN})
        return {accessToken:token, refreshToken:refreshToken}
    },
    async getUserIdByToken(token:string|undefined,secret?:string):Promise<{userId:ObjectId,deviceId:string}|null>{
        try {
            if(!token) { return null}
            let deviceId:any
            if(!secret){
                deviceId = jwt.verify(token, settings.JWT_SECRET)
                const user = await usersService.getUserMongoByDeviceId(deviceId.deviceId)
                if(!user) {return null}
                return {userId:user._id,deviceId:deviceId.deviceId}
            } else {
                const checkBlackList = await authService.checkBlackList(token);
                if(!checkBlackList){ return null}
                deviceId = jwt.verify(token, settings.REFRESH_TOKEN_SECRET)
                const user = await usersService.getUserMongoByDeviceId(deviceId.deviceId)
                if(!user) {return null}
                console.log(user._id)
                return {userId:user._id,deviceId:deviceId.deviceId}
            }
        } catch (e) {
            console.error(e)
            return null;
        }
    }
}
