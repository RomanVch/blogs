import {Router} from "express";
import { validBodyLogin, validBodyString} from "../utils/validators";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authService} from "../domain/auth-service";

export const authRouter = Router({});

authRouter.post('/login',
    validBodyLogin('loginOrEmail',1,500,'have'),
    validBodyString('password',1,15),
    errorsValidatorMiddleware,
    async (req, res) => {
        const {loginOrEmail,password} = req.body
        const authCheck = await authService.auth({loginOrEmail, password})
        if (authCheck) {
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
        }
    })
