import { NextFunction,Request,Response } from "express";
import {jwtService} from "../application/jwt-service";
import {usersService} from "../domain/users-service";
export const authJwt = async (req: Request, res: Response, next: NextFunction) => {
    if(req.headers.authorization) {
        const token = req.headers.authorization?.split(' ')[1]
        console.log(token);
        const userID = await jwtService.getUserIdByToken(token)
        console.log(userID);
        if(!userID) {
            res.sendStatus(401)
        } else {
            req.user = await usersService.getUserById(userID)
            next();
        }
    } else{
        res.sendStatus(401);
    }

}