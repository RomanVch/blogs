import {usersService} from "./users-service";
import {ObjectId} from "mongodb";

export const securityDevicesService = {
    async checkDeviceSession(deviceId:string){
        return await usersService.checkDeviceSession(deviceId);
    },
    async delOtherDevicesSession(userId:string,userAgent:string, ip:string){
        const user = await usersService.getUserMongoById(new ObjectId(userId));
        const activeSession = user?.devicesSessions.find((session) => session.ip === ip && session.title.substring(0, 46) === userAgent.substring(0, 46));
        if(!activeSession){ return null }
        const actualSession = {...activeSession, lastAccessed: new Date().toISOString()};
        const checkRemoveSession = await usersService.removeOtherSession(userId,actualSession)
        if(!checkRemoveSession){ return null }
        return checkRemoveSession
    },
    async removeIdDeviceSession (userId:string,deviceId:string):Promise<boolean>{
        return usersService.removeIdDeviceSession(userId,deviceId)
    },
}

