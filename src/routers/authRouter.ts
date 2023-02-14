import {Router} from "express";
import {
    validBodyEmail,
    validBodyLogin,
    validBodyString,
    validLoginOrEmail, validResentBodyEmail
} from "../utils/validators";
import {errorsValidatorAuthMiddleware, errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authService} from "../domain/auth-service";
import {jwtService} from "../application/jwt-service";
import {authJwt} from "../middlewares/authJwt";
import {usersService} from "../domain/users-service";
import {ObjectId} from "mongodb";
import {emailManager} from "../manager/email-manager";
import {generators} from "../utils/generators";
import {settings} from "../application/setting";
import rateLimit from "express-rate-limit";

// Создаем лимит на количество запросов для защищенного эндпоинта
const apiLimiter = rateLimit({
    windowMs: 10 * 1000, // Время окна (1 минута)
    max: 4, // Максимальное количество запросов в окне
});

export const authRouter = Router({});


authRouter.get('/me',authJwt,errorsValidatorMiddleware,async (req, res):Promise<any> => {
 try{
     const user = await usersService.getUserById(new ObjectId(req.user!.id))
     if(!user){ return res.status(404).send()}
      res.status(200).send({email:user.email, login:user.login, userId:user.id});
 }catch (err) {
     console.log(err)
     res.sendStatus(401);
 }
})
authRouter.post('/login',
    validLoginOrEmail(3,10,"have"),
    validBodyString('password',6,15),
    apiLimiter,
    errorsValidatorAuthMiddleware,
    async (req, res):Promise<any> => {
        const {loginOrEmail,password} = req.body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        if(!ip || !userAgent){ return res.sendStatus(400) }
        const deviceSession = await authService.auth({loginOrEmail, password,userAgent,ip:ip as string});
        if (!deviceSession) {
            res.sendStatus(401)
        }
        else {
            const token = await authService.getTokens(deviceSession.deviceId)
            if(token){
                res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: settings.SCOPE === 'production' });
                res.status(200).send({accessToken:token.accessToken});
            }
        }
    })

authRouter.post('/registration',
    validBodyLogin('login',3,10,"notHave"),
    validBodyString('password',6,20),
    validBodyEmail('email',4,1000),
    apiLimiter,
    errorsValidatorMiddleware,
    async (req, res):Promise<any> => {
        const {login,password,email} = req.body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        if(!ip || !userAgent){ return res.sendStatus(400) }
            const addUser = await usersService.addUser({login,password,email,userAgent,ip:ip as string})
              if(addUser){
                  const emailCheck = await emailManager.sendConfirmationEmail(email,addUser.confirmationCode)
                  if (emailCheck) {
                      res.sendStatus(204)
                  } else {
                        await usersService.delUser(addUser.user.id);
                        generators.messageRes({res,code:400,body:[{message:'problem mail server',field:"email"}]})
                  }
              } else {
                  generators.messageRes({res,code:400})
              }
    })

authRouter.post('/registration-confirmation',
    validBodyString("code",8,100),
    apiLimiter,
    errorsValidatorMiddleware,
    async (req, res) => {
        const {code} = req.body
        const checkConfirmationUser = await authService.registrationConfirmation(code as string)
        generators.messageRes({res,...checkConfirmationUser})
        }
    )

authRouter.post("/registration-email-resending",
    apiLimiter,
    validResentBodyEmail('email'),
    errorsValidatorMiddleware,
    async (req, res) => {
        const {email} = req.body
        const checkingEmail = await authService.resendingRegistrationEmail(email)
        generators.messageRes({res,...checkingEmail})
})

authRouter.post('/refresh-token',
    errorsValidatorMiddleware,
    async (req, res):Promise<any> => {
    try {
        if(!req.cookies.refreshToken){
            res.sendStatus(401)
            return
        }
        const token:string = req.cookies.refreshToken;
        if(!token) {
            res.sendStatus(401)
        }
        const ids = await jwtService.getUserIdByToken(token,'refresh')
        if(!ids){
            res.status(401).send()
            return
        }
        const newTokens = await authService.refreshToken(ids.deviceId,token);
        if(!newTokens) {
            res.status(400).send()
            return
        }
        const updateDeviceSession = await usersService.newEnterDeviceSession(ids.userId.toString(),ids.deviceId);
        if(!updateDeviceSession){ return null }

            res.cookie('refreshToken', newTokens.refreshToken, { httpOnly: true, secure: settings.SCOPE === 'production' });
            res.status(200).send({accessToken:newTokens.accessToken});
    }catch (err) {
        console.log(err)
    }
    })
authRouter.post('/logout',
    errorsValidatorMiddleware,
    async (req, res) => {
    try {
        if(!req.cookies.refreshToken){
            res.sendStatus(401)
            return
        }
        const token = req.cookies.refreshToken;
        const ids = await jwtService.getUserIdByToken(token,'refresh')
        if(!ids){
            res.status(401).send()
            return
        }
        const deleteToken = ids && await authService.logout(token);
        if(!deleteToken) {
            res.status(401).send()
            return
        }
        res.clearCookie('refreshToken');
        res.status(204).send()
    }catch (e) {
        console.log(e)
    }
    })