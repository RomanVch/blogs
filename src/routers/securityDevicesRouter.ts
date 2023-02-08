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
        if(!req.cookies.refreshToken){
            console.error('No refresh token',req.cookies.refreshToken)
            res.sendStatus(401)
        return
        }
        const token:string = req.cookies.refreshToken;
        const ids = await jwtService.getUserIdByToken(token,'refresh')
        if (!ids) {
            console.error('ids',ids)
            res.status(401).send()
            return
        }
        const user = await usersService.getUserMongoById(ids.userId);

        if(!user){
            console.error('user',user)
            res.status(401).send()
            return
        }
        res.status(200).send(user?.devicesSessions.map((session)=>{
            return {lastActiveDate: session.lastActiveDate,deviceId: session.deviceId,title: session.title, ip:session.ip}
        }));
    })
securityDevicesRouter.delete('/devices', errorsValidatorMiddleware, async (req, res) => {
    const { cookies: { refreshToken: token }, ip, headers: { 'user-agent': userAgent } } = req;
    const ids = await jwtService.getUserIdByToken(token, 'refresh');
    if (!ids || !ip || !userAgent) return res.status(401).send();
    const check = await securityDevicesService.delOtherDevicesSession(ids.userId,ids.deviceId)
    if (!check) {
        return res.status(401).send();
    }
    res.status(204).send();
});
securityDevicesRouter.delete('/devices/:id', errorsValidatorMiddleware, async (req, res) => {
    const deviceId = req.params.id;
    if (!deviceId) return res.sendStatus(404);

    const token = req.cookies.refreshToken;
    const ids = await jwtService.getUserIdByToken(token, 'refresh');

    if (!ids || !ids.deviceId || !ids.userId) return res.status(401).send();

    const checkDeviceSession = await securityDevicesService.checkDeviceSession(deviceId, ids.userId.toString());
    if (checkDeviceSession.message === 'db error') return res.sendStatus(404);
    if (checkDeviceSession.message === 'no permission') return res.sendStatus(403);
    if (checkDeviceSession.message === 'no device session') return res.sendStatus(404);

    const checkDeleteIdDeviceSession = await securityDevicesService.removeIdDeviceSession(ids.userId.toString(), deviceId);
    if (!checkDeleteIdDeviceSession) return res.sendStatus(401);

    return res.sendStatus(204);
});
