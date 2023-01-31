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


export const authRouter = Router({});


authRouter.get('/me',authJwt,errorsValidatorMiddleware,async (req, res) => {
    const user = await usersService.getUserById(new ObjectId(req.user!.id))
    if(!user){ return res.status(404).send()}
    return res.status(200).send({email:user.email, login:user.login, userId:user.id});
})
authRouter.post('/login',
    validLoginOrEmail(3,10,"have"),
    validBodyString('password',6,15),
    errorsValidatorAuthMiddleware,
    async (req, res) => {
        const {loginOrEmail,password} = req.body
        const user = await authService.auth({loginOrEmail, password})
        if (!user) {
            res.sendStatus(401)
        } /*else if(!user.emailConfirmation.isConfirmed){
            res.sendStatus(401)
        }*/
        else {
            const token = await authService.refreshToken(user._id.toString())
            if(token){
                res.cookie('token', {refreshToken:token.refreshToken}, { httpOnly: true });
                res.status(200).send({access_token:token.accessToken});
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
            const addUser = await usersService.addUser({login,password,email})
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
        const token = req.cookies.token.refreshToken;
        const userId = await jwtService.getUserIdByToken(token,'refresh')
        if(!userId){
            res.status(400).send()
            return
        }
        const newTokens = userId && await authService.refreshToken(userId.toString());
        console.log(newTokens)
        if(!newTokens) {
            res.status(400).send()
            return
        }
            res.cookie('token', {refreshToken:newTokens.refreshToken}, { httpOnly: true });
            res.status(200).send({access_token:newTokens.accessToken});
    })
authRouter.post('/logout',
    errorsValidatorMiddleware,
    async (req, res) => {
        const token = req.cookies.token.refreshToken;
        const userId = await jwtService.getUserIdByToken(token,'refresh')
        if(!userId){res.status(401).send()}
        const deleteToken = userId && await authService.refreshToken(userId.toString());
        if(!deleteToken) {res.status(401).send()}
        res.status(200).send()
    })