import {usersService} from "./users-service";
import {ObjectId} from "mongodb";
import {settings} from "../application/setting";

export const securityDevicesService = {
    async checkDeviceSession(deviceId:string, userId:string): Promise<{message:string}> {
        return await usersService.checkDeviceSession(deviceId,userId);
    },
    async delOtherDevicesSession(userId:ObjectId,deviceId:string){
     const checkRemoveSession = await usersService.removeOtherSession(userId,deviceId)
        if(!checkRemoveSession){
            return null }
        return checkRemoveSession
    },
    async removeIdDeviceSession (userId:string,deviceId:string):Promise<boolean>{
        return usersService.removeIdDeviceSession(userId,deviceId)
    },
}

