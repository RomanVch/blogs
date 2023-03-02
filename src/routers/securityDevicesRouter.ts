import { Router,Request,Response } from "express";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {jwtService} from "../application/jwt-service";
import {SecurityDevicesService} from "../domain/security-devices-service";
import {usersService} from "../compositionRoot";

export const securityDevicesRouter = Router({});

class SecurityDevicesController {
    securityDevicesService:SecurityDevicesService
    constructor() {
        this.securityDevicesService = new SecurityDevicesService
    }

    async getDevice (req:Request, res:Response) {
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
res.status(200).send(user?.devicesSessions.map((session)=>{
    return {lastActiveDate: session.lastActiveDate,deviceId: session.deviceId,title: session.title, ip:session.ip}
}));
}
    async deleteDevices (req:Request, res:Response):Promise<any> {
    const { cookies: { refreshToken: token }, ip, headers: { 'user-agent': userAgent } } = req;
const ids = await jwtService.getUserIdByToken(token, 'refresh');
if (!ids || !ip || !userAgent) return res.status(401).send();
const check = await this.securityDevicesService.delOtherDevicesSession(ids.userId,ids.deviceId)
if (!check) {
    return res.status(401).send();
}
res.status(204).send();
}
    async deleteDevicesId (req:Request, res:Response):Promise<any> {
    const deviceId = req.params.id;
    if (!deviceId) return res.sendStatus(404);

    const token = req.cookies.refreshToken;
    const ids = await jwtService.getUserIdByToken(token, 'refresh');

    if (!ids || !ids.deviceId || !ids.userId) return res.status(401).send();

    const checkDeviceSession = await this.securityDevicesService.checkDeviceSession(deviceId, ids.userId.toString());
    if (checkDeviceSession.message === 'db error') return res.sendStatus(404);
    if (checkDeviceSession.message === 'no permission') return res.sendStatus(403);
    if (checkDeviceSession.message === 'no device session') return res.sendStatus(404);

    const checkDeleteIdDeviceSession = await this.securityDevicesService.removeIdDeviceSession(ids.userId.toString(), deviceId);
    if (!checkDeleteIdDeviceSession) return res.sendStatus(401);

    return res.sendStatus(204);
}
}

const securityDevicesInstance = new SecurityDevicesController;

securityDevicesRouter.get('/devices',errorsValidatorMiddleware, securityDevicesInstance.getDevice)
securityDevicesRouter.delete('/devices', errorsValidatorMiddleware, securityDevicesInstance.deleteDevices.bind(securityDevicesInstance))
securityDevicesRouter.delete('/devices/:id', errorsValidatorMiddleware, securityDevicesInstance.deleteDevicesId.bind(securityDevicesInstance));
