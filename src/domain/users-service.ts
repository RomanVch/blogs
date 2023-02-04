import bcrypt from "bcrypt";
import {ObjectId} from "mongodb";
import  add from 'date-fns/add';
import { EndRouterT} from "../routers/blogsRouter";
import { v4 as uuidv4 } from 'uuid';
import {
    UserDevicesSessionsBaseT,
    UserDevicesSessionsT,
    UserForBaseIdT,
    UserMongoIdT,
    UserSimpleIdT
} from "../repository/types";
import {UsersQueryT} from "../routers/usersRouter";
import {usersDbRepository} from "../repository/users-db-repository";
import {de} from "date-fns/locale";
import {BodyForMessageT, MessageForResT} from "../utils/generators";
import {getDeviceSession} from "../utils/getDeviceSession";

type ReturnCreateUserT = {
    user:UserSimpleIdT,
    confirmationCode:string
}


export const usersService = {
    async getUsers(usersQuery:UsersQueryT):Promise<EndRouterT<UserSimpleIdT[]>|null> {
        return usersDbRepository.getUsers(usersQuery)
    },
    async getUserById(id:ObjectId):Promise<UserSimpleIdT|null>{
        const userMongo = await usersDbRepository.getUserById(new ObjectId(id))
        if(!userMongo){ return null}
            return {
                id: userMongo._id + "",
                login: userMongo.login,
                email: userMongo.email,
                createdAt: userMongo.createdAt
            }
        },
    async getUserMongoById(id:ObjectId):Promise<UserMongoIdT|null>{
        return  usersDbRepository.getUserById(new ObjectId(id))
    },
    async getUserMongoByDeviceId(deviceId:string):Promise<UserMongoIdT|null>{
        return  usersDbRepository.getUserByDeviceId(deviceId)
    },
    async addUser(newUserData:{login:string,password:string,email:string,userAgent:string,ip:string}): Promise<ReturnCreateUserT>{
        const {login,password,email,userAgent,ip}= newUserData
        const dateNow = new Date()
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, passwordSalt);
        const confirmationCode = uuidv4();
        const expirationDate = add(dateNow, {minutes:10})

        const newUser:UserForBaseIdT = {
            login,
            email,
            createdAt:dateNow.toISOString(),
            passwordHash,
            passwordSalt,
            emailConfirmation:{
             isConfirmed:false,
                expirationDate,
                confirmationCode
        },
            devicesSessions:[getDeviceSession(userAgent,ip)]
        }
        const userForUi = await usersDbRepository.addUser(newUser)
        return {user:userForUi,confirmationCode};
    },
    async addDevicesSessions (userId:string,deviceSession:UserDevicesSessionsBaseT): Promise<boolean>{
        return usersDbRepository.addDevicesSessions(userId,deviceSession)
    },
    async findDevicesSessions(userId: string,ip:string,title:string):Promise<UserDevicesSessionsBaseT|null>{
        return usersDbRepository.findUserDevicesSessions(userId,ip,title);
    },
    async newEnterDeviceSession (userId:string,deviceId:string): Promise<boolean>{
        const checkUpdateDevice = await usersDbRepository.newEnterDeviceSession(userId,deviceId);
        return true
    },
    async removeOtherSession(userId:string,deviceSession:UserDevicesSessionsBaseT): Promise<boolean>{
        console.log(await usersDbRepository.removeOtherSession(userId,deviceSession))
        return usersDbRepository.removeOtherSession(userId,deviceSession);
    },
    async removeIdDeviceSession(userId:string,deviceId:string): Promise<boolean>{
        return usersDbRepository.removeIdDeviceSession(userId,deviceId);
    },
    async delUser(id:string){
        return usersDbRepository.delUser(id);
    }
}