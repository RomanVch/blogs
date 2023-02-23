import {usersDbRepository} from "../repository/users-db-repository";
import bcrypt from "bcrypt";
import {AccessTokenT, RefreshTokenT, UserDevicesSessionsT} from "../repository/types";
import {BodyForMessageT, MessageForResT} from "../utils/generators";
import {emailManager} from "../manager/email-manager";
import {v4 as uuidv4} from 'uuid';
import {jwtService} from "../application/jwt-service";
import {infoBackDbRepository} from "../repository/infoBack-db-repository";
import {getDeviceSession} from "../utils/getDeviceSession";
import {usersService} from "./users-service";
import {securityDevicesService} from "./security-devices-service";
import {ObjectId} from "mongodb";

export const authService = {
    async auth(auth:{loginOrEmail:string,password:string,userAgent:string,ip:string}): Promise<UserDevicesSessionsT | null> {
        const {loginOrEmail,password, userAgent,ip} = auth
        const user = await usersDbRepository.getUserByLoginOrEmail(loginOrEmail)
        if (!user) { return null }
            const passwordHash = await bcrypt.hash(password,user.passwordSalt)
            if(user.passwordHash !== passwordHash) { return null }
            const deviceSession = getDeviceSession(userAgent,ip);
            const updateDeviceSession = await usersService.addDevicesSessions(user._id.toString(),deviceSession)
            if(!updateDeviceSession){ return null }
        return deviceSession
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
    async passwordRecoveryEmail (email:string): Promise<MessageForResT<BodyForMessageT>>{
        const user = await usersDbRepository.getUserEmail(email)
        if(!user){ return {code:204}}

        const uuid = uuidv4()
        const changeCode = await usersDbRepository.changeUserPasswordCode(user._id.toString(), uuid)
        if(!changeCode){ return {code:400,body: [{message:'dont change code password',field:'email'}]}}

        const emailSend = await emailManager.sendRecoveryPaswordCodeEmail(email,uuid)
        if(!emailSend){return {code:400,body: [{message:'email dont send',field:'email'}]}}

        return {code:204}
    },
    async getTokens (deviceId:string): Promise<AccessTokenT & RefreshTokenT|null>{
        const user = await usersDbRepository.getUserByDeviceId(deviceId)
        if(!user){ return null}
        const refreshToken = await jwtService.createJWT(deviceId)
        if(!refreshToken){ return null }
        return refreshToken
    },
    async refreshToken (deviceId:string,oldToken:string): Promise<AccessTokenT & RefreshTokenT|null>{
        const user = await usersDbRepository.getUserByDeviceId(deviceId)
        if(!user){ return null}
        const refreshToken = await jwtService.createJWT(deviceId)
        if(!refreshToken){ return null }
        const addBlackList = await infoBackDbRepository.addTokenInBlackList(oldToken)
        if(!addBlackList){return null}
        return refreshToken
    },
    async changePassword (newPassword:string, code:string){
        const user = await usersDbRepository.getUserByChangePasswordCode(code)
        if(!user){ return {code:400,body: [{message:'not found',field:'recoveryCode'}]}}
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, passwordSalt);
        const checkChangePassword = await usersDbRepository.changeUserPassword(user.id,passwordSalt,passwordHash)
        if(!checkChangePassword){return {code:400,body: [{message:'not change password',field:'password'}]}}
        return {code:204}
    },
    async logout(oldToken:string,ids:{userId:ObjectId,deviceId:string}){
        const addBlackList = await infoBackDbRepository.addTokenInBlackList(oldToken)
        const checkRemoveDeviceSession = await securityDevicesService.removeIdDeviceSession(ids.userId.toString(), ids.deviceId);
        if(!addBlackList || !checkRemoveDeviceSession){return null}
        return addBlackList
    },
    async checkBlackList(token:string){
        return infoBackDbRepository.findTokenInBlackList(token)
    }
}