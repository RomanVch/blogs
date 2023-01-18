import { EndRouterT} from "../routers/blogsRouter";
import {UserForBaseIdT, UserSimpleIdT} from "../repository/types";
import {UsersQueryT} from "../routers/usersRouter";
import {usersDbRepository} from "../repository/users-db-repository";
import bcrypt from "bcrypt";
export const usersService = {
    async getUsers(usersQuery:UsersQueryT):Promise<EndRouterT<UserSimpleIdT[]>|null> {
        return usersDbRepository.getUsers(usersQuery)
    },
    async addUser(newUserData:{login:string,password:string,email:string}): Promise<UserSimpleIdT>{
        const dateNow = new Date()
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newUserData.password, passwordSalt);
        const newUser:UserForBaseIdT = {
            login: newUserData.login,
            email: newUserData.email,
            createdAt:dateNow.toISOString(),
            passwordHash,
            passwordSalt
        }
        return usersDbRepository.addUser(newUser);
    },
    async delUser(id:string){
        return usersDbRepository.delUser(id);
    }
}