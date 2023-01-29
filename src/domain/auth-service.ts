import {usersDbRepository} from "../repository/users-db-repository";
import bcrypt from "bcrypt";
import {UserMongoIdT} from "../repository/types";
import {ErrorMessage, StatusMessage} from "../types/types";
import {BodyForMessageT, MessageForResT} from "../utils/generators";
import {emailManager} from "../manager/email-manager";
import { v4 as uuidv4 } from 'uuid';

export const authService = {
    async auth(auth:{loginOrEmail:string,password:string}): Promise<UserMongoIdT|null>{
        const {loginOrEmail,password} = auth
        const user = await usersDbRepository.getUserByLoginOrEmail(loginOrEmail)
        console.log("===",user)
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
    }

    }