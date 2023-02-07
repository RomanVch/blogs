import {usersService} from "./users-service";
import {ObjectId} from "mongodb";
import {settings} from "../application/setting";

export const securityDevicesService = {
    async checkDeviceSession(deviceId:string, userId:string): Promise<{message:string}> {
        return await usersService.checkDeviceSession(deviceId,userId);
    },
    async delOtherDevicesSession(userId:string,userAgent:string, ip:string){
        const user = await usersService.getUserMongoById(new ObjectId(userId));
        console.log(userAgent,ip,user)
        const activeSession = user?.devicesSessions.find((session) => session.ip === ip && session.title.substring(0, 46) === userAgent.substring(0, 46));
        if(!activeSession){
            return null }
        const actualSession = {...activeSession, lastActiveDate: new Date().toISOString(),deleteActiveDate: new Date(Date.now() + settings.TIME_LIFE_MS_REFRESH_TOKEN).toISOString()};
        const checkRemoveSession = await usersService.removeOtherSession(userId,actualSession)
        if(!checkRemoveSession){
            return null }
        return checkRemoveSession
    },
    async removeIdDeviceSession (userId:string,deviceId:string):Promise<boolean>{
        return usersService.removeIdDeviceSession(userId,deviceId)
    },
}

