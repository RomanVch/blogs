import {client} from "./dataBase";
import {InfoServerT, UserForBaseIdT, UserMongoIdT, UserSimpleIdT} from "./types";
import {EndRouterT} from "../routers/blogsRouter";
import {mapper} from "../utils/mapper";
import {UsersQueryT} from "../routers/usersRouter";
import {ObjectId} from "mongodb";
import {tr} from "date-fns/locale";

const infoBackDb = client.db("blogs").collection<InfoServerT>("infoBack")

export const infoBackDbRepository = {
    async addTokenInBlackList(oldToken:string):Promise<boolean>{
        try{
            const checkBlackList = await infoBackDb.findOne({});
            if(!checkBlackList){
                await infoBackDb.insertOne({blackList:[oldToken]});
            }else{
                if(!checkBlackList._id){
                    return false;
                }
                await infoBackDb.updateOne({_id:checkBlackList._id},{$push:{blackList:oldToken}});
            }
            return true
        } catch(e){
            console.error(e)
            return false
        }
    },
    async findTokenInBlackList(token:string):Promise<boolean>{
        try{
            const tokenFind = await infoBackDb.findOne({})
            if(tokenFind && !tokenFind.blackList.length){
                return false
            }
            return !!tokenFind?.blackList.includes(token)
        } catch(e){
            console.error(e)
            return true
        }
    },
}