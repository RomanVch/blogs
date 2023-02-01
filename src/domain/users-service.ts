import bcrypt from "bcrypt";
import {ObjectId} from "mongodb";
import  add from 'date-fns/add';
import { EndRouterT} from "../routers/blogsRouter";
import { v4 as uuidv4 } from 'uuid';
import {UserForBaseIdT, UserMongoIdT, UserSimpleIdT} from "../repository/types";
import {UsersQueryT} from "../routers/usersRouter";
import {usersDbRepository} from "../repository/users-db-repository";

type ReturnCreateUserT = {
    user:UserSimpleIdT,
    confirmationCode:string
}


export const usersService = {
    async getUsers(usersQuery:UsersQueryT):Promise<EndRouterT<UserSimpleIdT[]>|null> {
        return usersDbRepository.getUsers(usersQuery)
    },
    async getUserById(id:ObjectId):Promise<UserSimpleIdT|null>{
       const userMongo = await usersDbRepository.getUserById(id)
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

    async addUser(newUserData:{login:string,password:string,email:string}): Promise<ReturnCreateUserT>{
        const dateNow = new Date()
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newUserData.password, passwordSalt);
        const confirmationCode = uuidv4();
        const expirationDate = add(new Date(), {minutes:10})
        const newUser:UserForBaseIdT = {
            login: newUserData.login,
            email: newUserData.email,
            createdAt:dateNow.toISOString(),
            passwordHash,
            passwordSalt,
            emailConfirmation:{
             isConfirmed:false,
                expirationDate,
                confirmationCode
        }
        }
        const userForUi = await usersDbRepository.addUser(newUser)
        return {user:userForUi,confirmationCode};
    },
    async delUser(id:string){
        return usersDbRepository.delUser(id);
    }
}