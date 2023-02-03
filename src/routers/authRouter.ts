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
import {tr} from "date-fns/locale";


export const authRouter = Router({});


authRouter.get('/me',authJwt,errorsValidatorMiddleware,async (req, res) => {
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
    errorsValidatorAuthMiddleware,
    async (req, res) => {
        const {loginOrEmail,password} = req.body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        console.log(1)
        if(!ip || !userAgent){ return res.sendStatus(400) }
        const user = await authService.auth({loginOrEmail, password,userAgent,ip:ip as string});
        console.log(2)
        if (!user) {
            res.sendStatus(401)
        } /* else if(!user.emailConfirmation.isConfirmed){
            res.sendStatus(401)
        }*/
        else {
            console.log(3)
            const token = await authService.getTokens(user._id.toString())
            if(token){
                console.log(4)
                res.cookie('refreshToken', token.refreshToken, { httpOnly: true,secure: true });
                res.status(200).send({accessToken:token.accessToken});
            }
        }
    })

authRouter.post('/registration',
    validBodyLogin('login',3,10,"notHave"),
    validBodyString('password',6,20),
    validBodyEmail('email',4,1000),
    errorsValidatorMiddleware,
    async (req, res) => {
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
    errorsValidatorMiddleware,
    async (req, res) => {
        const {code} = req.body
        const checkConfirmationUser = await authService.registrationConfirmation(code as string)
        generators.messageRes({res,...checkConfirmationUser})
        }
    )

authRouter.post("/registration-email-resending",
    validResentBodyEmail('email'),
    errorsValidatorMiddleware,
    async (req, res) => {
        const {email} = req.body
        const checkingEmail = await authService.resendingRegistrationEmail(email)
        generators.messageRes({res,...checkingEmail})
})

authRouter.post('/refresh-token',
    errorsValidatorMiddleware,
    async (req, res) => {
    try {
        if(!req.cookies.refreshToken){res.sendStatus(401)}
        const token:string = req.cookies.refreshToken;
        if(!token) {res.sendStatus(401)}
        const userId = await jwtService.getUserIdByToken(token,'refresh')
        if(!userId){
            res.status(401).send()
            return
        }
        const newTokens = await authService.refreshToken(userId.toString(),token);
        if(!newTokens) {
            res.status(400).send()
            return
        }
            res.cookie('refreshToken', newTokens.refreshToken, { httpOnly: true, secure:true });
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
        const userId = await jwtService.getUserIdByToken(token,'refresh')
        if(!userId){res.status(401).send()}
        const deleteToken = userId && await authService.logout(token);
        if(!deleteToken) {res.status(401).send()}
        res.clearCookie('refreshToken');
        res.status(204).send()
    }catch (e) {
        console.log(e)
    }
    })