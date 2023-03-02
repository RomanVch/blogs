import bcrypt from "bcrypt";
import {ObjectId} from "mongodb";
import add from 'date-fns/add';
import {EndRouterT} from "../routers/blogsRouter";
import {v4 as uuidv4} from 'uuid';
import {User, UserDevicesSessionsBaseT, UserMongoIdT, UserSimpleIdT} from "../repository/types";
import {UsersQueryT} from "../routers/usersRouter";
import {UsersDbRepository, usersDbRepository} from "../repository/users-db-repository";

type ReturnCreateUserT = {
    user:UserSimpleIdT,
    confirmationCode:string
}

export class UsersService {
    constructor(protected usersDbRepository:UsersDbRepository) {}
    async getUsers(usersQuery:UsersQueryT):Promise<EndRouterT<UserSimpleIdT[]>|null> {
        return this.usersDbRepository.getUsers(usersQuery)
    }
    async getUserById(id:ObjectId):Promise<UserSimpleIdT|null>{
        const userMongo = await this.usersDbRepository.getUserById(new ObjectId(id))
        if(!userMongo){ return null}
        return {
            id: userMongo._id + "",
            login: userMongo.login,
            email: userMongo.email,
            createdAt: userMongo.createdAt
        }
    }
    async getUserMongoById(id:ObjectId):Promise<UserMongoIdT|null>{
        return  this.usersDbRepository.getUserById(new ObjectId(id))
    }
    async getUserMongoByDeviceId(deviceId:string):Promise<UserMongoIdT|null>{
        return  this.usersDbRepository.getUserByDeviceId(deviceId)
    }
    async addUser(newUserData:{login:string,password:string,email:string,userAgent:string,ip:string}): Promise<ReturnCreateUserT>{
        const {login,password,email}= newUserData
        const dateNow = new Date()
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, passwordSalt);
        const confirmationCode = uuidv4();
        const expirationDate = add(dateNow, {minutes:10})

        const user = new User(login,email,dateNow.toISOString(),passwordHash,passwordSalt,"",{
            isConfirmed:false,
            expirationDate,
            confirmationCode
        },[])

        const userForUi = await this.usersDbRepository.addUser(user)
        return {user:userForUi,confirmationCode};
    }
    async addDevicesSessions (userId:string,deviceSession:UserDevicesSessionsBaseT): Promise<boolean>{
        return this.usersDbRepository.addDevicesSessions(userId,deviceSession)
    }
    async findDevicesSessions(userId: string,ip:string,title:string):Promise<UserDevicesSessionsBaseT|null>{
        return this.usersDbRepository.findUserDevicesSessions(userId,ip,title);
    }
    async newEnterDeviceSession (userId:string,deviceId:string): Promise<boolean>{
        const checkUpdateDevice = await this.usersDbRepository.newEnterDeviceSession(userId,deviceId);
        return true
    }
    async checkDeviceSession(deviceId:string, userId:string): Promise<{message:string}>{
        return this.usersDbRepository.checkDeviceSession(deviceId, userId)
    }
    async removeOtherSession(userId:ObjectId,deviceId:string): Promise<boolean>{
        return this.usersDbRepository.removeOtherSession(userId,deviceId);
    }
    async removeIdDeviceSession(userId:string,deviceId:string): Promise<boolean>{
        return this.usersDbRepository.removeIdDeviceSession(userId,deviceId);
    }
    async delUser(id:string) {
        return this.usersDbRepository.delUser(id);
    }
}

export const usersService = new UsersService(usersDbRepository);