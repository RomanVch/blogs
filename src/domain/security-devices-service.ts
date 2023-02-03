
import {BlogSimpleIdT, CorrectPostT, DataForNewPostT, PostMongoIdT, PostSimpleIdT, PostT} from "../repository/types";
import {postInDbRepository} from "../repository/post-in-db-repository";
import {PostsQueryT} from "../routers/postRouter";
import {blogsDbRepository} from "../repository/blogs-db-repository";
import {blogsService} from "./blog-service";
import {EndRouterT} from "../routers/blogsRouter";
import {usersService} from "./users-service";
import {ObjectId} from "mongodb";
import {getDeviceSession} from "../utils/getDeviceSession";

export const securityDevicesService = {
    async delOtherDevicesSession(userId:string,userAgent:string, ip:string){
        const user = await usersService.getUserMongoById(new ObjectId(userId));
        const activeSession = user?.devicesSessions.find((session) => session.ip === ip && session.title === userAgent);
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

