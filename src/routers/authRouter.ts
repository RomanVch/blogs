import {Router} from "express";
import {validBodyString, validLoginOrEmail} from "../utils/validators";
import {errorsValidatorAuthMiddleware, errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authService} from "../domain/auth-service";
import {jwtService} from "../application/jwt-service";
import {authJwt} from "../middlewares/authJwt";
import {usersService} from "../domain/users-service";
import {ObjectId} from "mongodb";

export const authRouter = Router({});


authRouter.get('/me',authJwt,errorsValidatorMiddleware,async (req, res) => {
    const user = await usersService.getUserById(new ObjectId(req.user!.id))
    if(!user){ return res.status(404).send()}
    return res.status(200).send(user);
})
authRouter.post('/login',
    validLoginOrEmail(3,10,"have"),
    validBodyString('password',1,15),
    errorsValidatorAuthMiddleware,
    async (req, res) => {
        const {loginOrEmail,password} = req.body
        const user = await authService.auth({loginOrEmail, password})
        if (!user) {
            res.sendStatus(401)
        } else {
            const token = await jwtService.createJWT(user)
            res.status(200).send(token);
        }
    })
