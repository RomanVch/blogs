import {usersDbRepository} from "../repository/users-db-repository";
import bcrypt from "bcrypt";
import {AccessTokenT, RefreshTokenT, UserMongoIdT} from "../repository/types";
import {BodyForMessageT, MessageForResT} from "../utils/generators";
import {emailManager} from "../manager/email-manager";
import { v4 as uuidv4 } from 'uuid';
import {ObjectId} from "mongodb";
import {jwtService} from "../application/jwt-service";
import {infoBackDbRepository} from "../repository/infoBack-db-repository";

export const authService = {
    async auth(auth:{loginOrEmail:string,password:string}): Promise<UserMongoIdT|null>{
        const {loginOrEmail,password} = auth
        const user = await usersDbRepository.getUserByLoginOrEmail(loginOrEmail)
        if(!user){ return null}
            const passwordHash = await bcrypt.hash(password,user.passwordSalt)
            return user.passwordHash === passwordHash ? user:null;
    },
    async registrationConfirmation(code:string): Promise<MessageForResT<BodyForMessageT>>{
        const user = await usersDbRepository.getUserByConfirmedCode(code)
        if(!user){ return {code:400,body: [{message:'not found',field:'code'}]}}
        if(user?.isConfirmed) {return {code:400,body:[{message:'this user confirmed',field:'code'}]}}
        const change =  await usersDbRepository.changeUserByIsConfirmedCode(user.id)

        if(change){
            return {code:204}
        } else {return {code:400,body:[{message:'not confirmed',field:'code'}]}}
            },

    async resendingRegistrationEmail (email:string): Promise<MessageForResT<BodyForMessageT>>{
        const user = await usersDbRepository.getUserEmail(email)
        if(!user){ return {code:400,body: [{message:'not found',field:'email'}]}}
        if(user.emailConfirmation.isConfirmed){ return {code:400,body: [{message:'this account confirmed',field:'email'}]}}

        const uuid = uuidv4()
        const changeCode = await usersDbRepository.changeUserByConfirmedCode(user._id.toString(), uuid)
        if(!changeCode){ return {code:400,body: [{message:'email dont send.',field:'email'}]}}

        const emailSend = await emailManager.sendConfirmationEmail(email,uuid)
        if(!emailSend){return {code:400,body: [{message:'email dont send',field:'email'}]}}

        return {code:204}
    },
    async getTokens (id:string): Promise<AccessTokenT & RefreshTokenT|null>{
        const user = await usersDbRepository.getUserById(new ObjectId(id))
        if(!user){ return null}
        const refreshToken = await jwtService.createJWT(user)
        if(!refreshToken){ return null }
        return refreshToken
    },
    async refreshToken (id:string,oldToken:string): Promise<AccessTokenT & RefreshTokenT|null>{
        const user = await usersDbRepository.getUserById(new ObjectId(id))
        if(!user){ return null}
        console.log(`refresh token1`)
        const refreshToken = await jwtService.createJWT(user)
        if(!refreshToken){ return null }
        console.log(`refresh token2`)
        const addBlackList = await infoBackDbRepository.addTokenInBlackList(oldToken)
        if(!addBlackList){return null}
        console.log(`refresh token3`)
        return refreshToken
    },
    async logout(oldToken:string){
        const addBlackList = await infoBackDbRepository.addTokenInBlackList(oldToken)
        if(!addBlackList){return null}
        return addBlackList
    },
    async checkBlackList(token:string){
        const boolBlackList = await infoBackDbRepository.findTokenInBlackList(token)
        return !boolBlackList
    }
}