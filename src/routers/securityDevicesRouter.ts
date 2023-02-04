import { Router } from "express";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authJwt} from "../middlewares/authJwt";
import {usersService} from "../domain/users-service";
import {ObjectId} from "mongodb";
import {jwtService} from "../application/jwt-service";
import {securityDevicesService} from "../domain/security-devices-service";

export const securityDevicesRouter = Router({});
securityDevicesRouter.get('/devices',errorsValidatorMiddleware,
    async (req, res) => {
        if(!req.cookies.refreshToken){res.sendStatus(401)
        return
        }
        const token:string = req.cookies.refreshToken;
        const ids = await jwtService.getUserIdByToken(token,'refresh')
        if (!ids) {
            res.status(401).send()
            return
        }
        const user = await usersService.getUserMongoById(ids.userId);

        if(!user){
            res.status(401).send()
            return
        }
        res.status(200).send(user?.devicesSessions);
    })
securityDevicesRouter.delete('/devices',errorsValidatorMiddleware,
    async (req, res) => {
        if(!req.cookies.refreshToken){
            res.sendStatus(401)
            return
        }
        const token:string = req.cookies.refreshToken;
        const ids = await jwtService.getUserIdByToken(token,'refresh')
        if (!ids) {
            res.status(401).send()
            return
        }
        const user = await usersService.getUserMongoById(ids.userId);
        if(!user){
            res.status(401).send()
            return
        }
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        if(!ip || !userAgent){res.sendStatus(400)
            return }
        const checkRemoveOtherSession = await securityDevicesService.delOtherDevicesSession(ids.userId.toString(),userAgent,ip as string)
        if(!checkRemoveOtherSession){
            res.sendStatus(401)
            return
        }
        res.sendStatus(204)
    })
securityDevicesRouter.delete('/devices/:id',errorsValidatorMiddleware,
    async (req, res) => {
        const deviceId = req.params.id
        if(!deviceId) { res.sendStatus(404) }
        const token:string = req.cookies.refreshToken;
        const ids = await jwtService.getUserIdByToken(token,'refresh');

        if (!ids || !ids.deviceId || !ids.userId) {
            res.status(401).send()
            return
        }
        const checkDeleteIdDeviceSession = await securityDevicesService.removeIdDeviceSession(ids.userId.toString(),deviceId)
        if(!checkDeleteIdDeviceSession){
            res.sendStatus(401)
            return
        }
        res.sendStatus(204)
    })
