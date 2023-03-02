import {Request,Response, Router} from "express";
import {
    validBodyEmail,
    validBodyLogin,
    validBodyString,
    validLoginOrEmail, validResentBodyEmail
} from "../utils/validators";
import {errorsValidatorAuthMiddleware, errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {jwtService} from "../application/jwt-service";
import {authJwt} from "../middlewares/authJwt";
import {ObjectId} from "mongodb";
import {emailManager} from "../manager/email-manager";
import {generators} from "../utils/generators";
import {settings} from "../application/setting";
import rateLimit from "express-rate-limit";
import {UsersService} from "../domain/users-service";
import {AuthService} from "../domain/auth-service";
import {usersDbRepository} from "../repository/users-db-repository";

// Создаем лимит на количество запросов для защищенного эндпоинта
const apiLimiter = rateLimit({
    windowMs: 10 * 1000,
    max: 5,
    keyGenerator: function(req) {
        return req.path; // генерируем ключ на основе URL
    }
});

export const authRouter = Router({});


class AuthController {
    usersService: UsersService;
    authService: AuthService;
    constructor() {
        this.usersService = new UsersService(usersDbRepository);
        this.authService = new AuthService;
    }
    async getMe (req:Request, res:Response):Promise<any> {
    try{
    const user = await this.usersService.getUserById(new ObjectId(req.user!.id))
    if(!user){ return res.status(404).send()}
res.status(200).send({email:user.email, login:user.login, userId:user.id});
}catch (err) {
    console.log(err)
    res.sendStatus(401);}}

    async login (req:Request, res:Response):Promise<any> {
    const {loginOrEmail,password} = req.body
const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
const userAgent = req.headers['user-agent']
if(!ip || !userAgent){ return res.sendStatus(400) }
const deviceSession = await this.authService.auth({loginOrEmail, password,userAgent,ip:ip as string});
if (!deviceSession) {
    res.sendStatus(401)
}
else {
    const token = await this.authService.getTokens(deviceSession.deviceId)
    if(token){
        res.cookie('refreshToken', token.refreshToken, { httpOnly: true, secure: settings.SCOPE === 'production' });
        res.status(200).send({accessToken:token.accessToken});
    }
}
}

async registration  (req:Request, res:Response):Promise<any> {
    const {login,password,email} = req.body
const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
const userAgent = req.headers['user-agent']
if(!ip || !userAgent){ return res.sendStatus(400) }
const addUser = await this.usersService.addUser({login,password,email,userAgent,ip:ip as string})
if(addUser){
    const emailCheck = await emailManager.sendConfirmationEmail(email,addUser.confirmationCode)
    if (emailCheck) {
        res.sendStatus(204)
    } else {
        await this.usersService.delUser(addUser.user.id);
        generators.messageRes({res,code:400,body:[{message:'problem mail server',field:"email"}]})
    }
} else {
    generators.messageRes({res,code:400})
}
}

async registrationConfirm (req:Request, res:Response):Promise<any> {
    const {code} = req.body
    const checkConfirmationUser = await this.authService.registrationConfirmation(code as string)
    generators.messageRes({res,...checkConfirmationUser})
}

async registrationEmailResending (req:Request, res:Response):Promise<any> {
    const {email} = req.body
    const checkingEmail = await this.authService.resendingRegistrationEmail(email)
    generators.messageRes({res,...checkingEmail})
}
async passwordRecovery (req:Request, res:Response):Promise<any> {
    const {email} = req.body
    const checkingEmail = await this.authService.passwordRecoveryEmail(email)
    generators.messageRes({res,...checkingEmail})
}
async newPassword (req:Request, res:Response):Promise<any> {
    const {newPassword, recoveryCode} = req.body
    const checkingChangePassword = await this.authService.changePassword(newPassword, recoveryCode)
    generators.messageRes({res,...checkingChangePassword})
}
    async refreshToken (req:Request, res:Response):Promise<any> {
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
            const newTokens = await this.authService.refreshToken(ids.deviceId,token);
            if(!newTokens) {
                res.status(400).send()
                return
            }
            const updateDeviceSession = await this.usersService.newEnterDeviceSession(ids.userId.toString(),ids.deviceId);
            if(!updateDeviceSession){ return null }

            res.cookie('refreshToken', newTokens.refreshToken, { httpOnly: true, secure: settings.SCOPE === 'production' });
            res.status(200).send({accessToken:newTokens.accessToken});
        }catch (err) {
            console.log(err)
        }
    }
    async logout (req:Request, res:Response):Promise<any> {
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
            const deleteToken = ids && await this.authService.logout(token,ids);

            if(!deleteToken) {
                res.status(401).send()
                return
            }
            res.clearCookie('refreshToken');
            res.status(204).send()
        }catch (e) {
            console.log(e)
        }
    }
}

const authControllerInstance = new AuthController

authRouter.get('/me',authJwt,errorsValidatorMiddleware,authControllerInstance.getMe.bind(authControllerInstance))
authRouter.post('/login',
    apiLimiter,
    validLoginOrEmail(3,10,"have"),
    validBodyString('password',6,15),
    errorsValidatorAuthMiddleware,
    authControllerInstance.login.bind(authControllerInstance)
    )

authRouter.post('/registration',
    validBodyLogin('login',3,10,"notHave"),
    validBodyString('password',6,20),
    validBodyEmail('email',4,1000),
    errorsValidatorMiddleware,
    apiLimiter,
    authControllerInstance.registration.bind(authControllerInstance)
    )

authRouter.post('/registration-confirmation',
    validBodyString("code",8,100),
    errorsValidatorMiddleware,
    apiLimiter,
    authControllerInstance.registrationConfirm.bind(authControllerInstance)
    )

authRouter.post("/registration-email-resending",
    validResentBodyEmail('email'),
    errorsValidatorMiddleware,
    apiLimiter,
    authControllerInstance.registrationEmailResending.bind(authControllerInstance)
    )
authRouter.post("/password-recovery",
    validResentBodyEmail('email'),
    errorsValidatorMiddleware,
    apiLimiter,
    authControllerInstance.passwordRecovery.bind(authControllerInstance)
    )
authRouter.post("/new-password",
    validBodyString('newPassword',6,50),
    validBodyString('recoveryCode',6,100),
    errorsValidatorMiddleware,
    apiLimiter,
    authControllerInstance.newPassword.bind(authControllerInstance)
    )
authRouter.post('/refresh-token',
    errorsValidatorMiddleware,
    authControllerInstance.refreshToken.bind(authControllerInstance)
    )
authRouter.post('/logout',
    errorsValidatorMiddleware,
    authControllerInstance.logout.bind(authControllerInstance)
    )