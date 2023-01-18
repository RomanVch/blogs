import {Router} from "express";
import {validBodyLogin, validBodyString, validLoginOrEmail} from "../utils/validators";
import {errorsValidatorAuthMiddleware, errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authService} from "../domain/auth-service";

export const authRouter = Router({});

authRouter.post('/login',
    validLoginOrEmail(3,10,"have"),
    validBodyString('password',1,15),
    errorsValidatorAuthMiddleware,
    async (req, res) => {
        const {loginOrEmail,password} = req.body
        const authCheck = await authService.auth({loginOrEmail, password})
        if (authCheck) {
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
        }
    })
