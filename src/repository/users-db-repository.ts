import {client} from "./dataBase";
import {UserDevicesSessionsBaseT, UserForBaseIdT, UserMongoIdT, UserSimpleIdT} from "./types";
import {EndRouterT} from "../routers/blogsRouter";
import {mapper} from "../utils/mapper";
import {UsersQueryT} from "../routers/usersRouter";
import {ObjectId} from "mongodb";

const usersDb = client.db("blogs").collection<UserMongoIdT>("users")

export const usersDbRepository = {
    async getUsers(usersQuery:UsersQueryT):Promise<EndRouterT<UserSimpleIdT[]>|null> {
        if(usersQuery.pageNumber && usersQuery.pageSize && usersQuery.sortBy){
            const skip = (usersQuery.pageNumber -1) * usersQuery.pageSize;
            const direction = usersQuery.sortDirection === "desc"? -1 : 1;
            const getRegex = (name:string|undefined|null) => {
                if(name){
                    return new RegExp(`${name}`, "i")}
                return new RegExp(``, "i")
                }
            const users = await usersDb
                .find({$or: [{login: getRegex(usersQuery.searchLoginTerm)}, {email: getRegex(usersQuery.searchEmailTerm )}]})
                .skip(skip)
                .limit(usersQuery.pageSize)
                .sort({[usersQuery.sortBy]:direction})
                .toArray()
            const blogsCount = await usersDb
                .find({$or: [{login: getRegex(usersQuery.searchLoginTerm)}, {email: getRegex(usersQuery.searchEmailTerm )}]})
                .count();

            return {
                pagesCount: Math.ceil(blogsCount / usersQuery.pageSize),
                page: usersQuery.pageNumber,
                pageSize: usersQuery.pageSize,
                totalCount: blogsCount,
                items: users.map((user) => mapper.getUserPost(user))
            };
        }
        return null
    },
    async getUserById(id:ObjectId){
        return usersDb.findOne({_id: id})
    },
    async getUserByDeviceId(deviceId:string){
        return usersDb.findOne({'devicesSessions.deviceId': deviceId})
    },
    async getUserByConfirmedCode(code:string):Promise<UserSimpleIdT & {isConfirmed:boolean}|null>{
        const user = await usersDb.findOne({"emailConfirmation.confirmationCode": code})

        if(user){
            return {
                id:user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt,
                isConfirmed:user.emailConfirmation.isConfirmed
            }
        } else{
            return null
        }
    },
    async changeUserByIsConfirmedCode(id:string):Promise<boolean>{
       try{
        await usersDb.updateOne({_id:new ObjectId(id)},{$set:{'emailConfirmation.isConfirmed': true}})
        return true
       } catch(e){
           console.error(e)
           return false
       }
       },
    async changeUserByConfirmedCode(id:string,code:string):Promise<boolean>{
        try{
            await usersDb.updateOne({_id:new ObjectId(id)},{$set:{'emailConfirmation.confirmationCode': code}})
            return true
        } catch(e){
            console.error(e)
            return false
        }
    },
    async getUserLogin(login:string):Promise<UserMongoIdT|null> {
        return  usersDb.findOne({login})
    },
    async getUserEmail(email:string):Promise<UserMongoIdT|null> {
        return  usersDb.findOne({email})
    },
    async getUserByLoginOrEmail(loginOrEmail:string):Promise<UserMongoIdT|null> {
        return  usersDb.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
    },
    async addUser(newUser:UserForBaseIdT): Promise<UserSimpleIdT>{
        const result = await client.db('blogs').collection('users').insertOne(newUser);
        return {
            id:result.insertedId.toString(),
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt,
        }
    },
    async addDevicesSessions(userId: string, deviceSession: UserDevicesSessionsBaseT): Promise<boolean> {
        try {
            await usersDb.updateOne({_id:new ObjectId(userId)},{$push:{devicesSessions:deviceSession}});
            return true
        }catch (error) {
            console.error(error);
            return false;
        }
    },
    async findUserDevicesSessions(userId: string,ip:string,title:string):Promise<UserDevicesSessionsBaseT|null> {
        const user = await usersDb.findOne({_id:new ObjectId(userId)})
        const checkDeviceSession = user?.devicesSessions.find((deviceSession) => deviceSession.ip == ip && deviceSession.title.substring(0,46) == title.substring(0,46))
        if(!checkDeviceSession){
            return null
        }else {
            return checkDeviceSession
        }
    },
    async newEnterDeviceSession(userId:string,deviceId:string):Promise<boolean> {
        try {
            await usersDb.updateOne({'devicesSessions.deviceId': deviceId}, {$set: {'devicesSessions.$.lastActiveDate': new Date().toISOString()}});
            return true
        }catch (error) {
            console.error(error);
            return false
        }
        },
    async removeOtherSession(userId:string,deviceSession:UserDevicesSessionsBaseT):Promise<boolean> {
       try {
           await usersDb.updateOne({'devicesSessions.deviceId':deviceSession.deviceId},{$set:{devicesSessions:[deviceSession]}});
           return true
       } catch (e){
           console.error(e);
           return false
       }
       },
    async removeIdDeviceSession(userId:string,deviceId:string):Promise<boolean> {
        try {
            await usersDb.updateOne(
                { _id: new ObjectId(userId) },
                { $pull: { devicesSessions: { deviceId: deviceId } } }
            )
            return true
        } catch (e){
            console.error(e);
            return false
        }
    },
    async delUser(id:string) {
        const result = await usersDb.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1
    }
}