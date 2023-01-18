import {usersDbRepository} from "../repository/users-db-repository";
import bcrypt from "bcrypt";
export const authService = {
    async auth(auth:{loginOrEmail:string,password:string}): Promise<boolean>{
        const {loginOrEmail,password} = auth
        const user = await usersDbRepository.getUserByLoginOrEmail(loginOrEmail)
        if(!user){ return false }
        const passwordHash = await bcrypt.hash(password,user.passwordSalt)
        return user.passwordHash === passwordHash;

    }
}