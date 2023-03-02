import {infoBackModel} from "./Schemas";

const infoBackDb = infoBackModel //client.db("blogs").collection<InfoServerT>("infoBack")

class InfoBackDbRepository  {
    async addTokenInBlackList(oldToken:string):Promise<boolean>{
        try{
            const checkBlackList = await infoBackDb.findOne({});
            if(!checkBlackList){
                await infoBackDb.create({blackList:[oldToken]});
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
    }
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
    }
}


export const infoBackDbRepository = new InfoBackDbRepository;