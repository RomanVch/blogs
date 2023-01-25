import {usersDbRepository} from "../repository/users-db-repository";
import bcrypt from "bcrypt";
import {UserMongoIdT} from "../repository/types";

export const authService = {
    async auth(auth:{loginOrEmail:string,password:string}): Promise<UserMongoIdT|null>{
        const {loginOrEmail,password} = auth
        const user = await usersDbRepository.getUserByLoginOrEmail(loginOrEmail)
        if(!user){ return null }
        const passwordHash = await bcrypt.hash(password,user.passwordSalt)
        return user;
    }
}