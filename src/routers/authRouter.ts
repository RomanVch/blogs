import {Router} from "express";
import {
    validBodyEmail,
    validBodyLogin,
    validBodyString,
    validLoginOrEmail
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
    return res.status(200).send(user);
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
        } else if(user.emailConfirmation.isConfirmed){
            res.sendStatus(401)
        }
        else {
            const token = await jwtService.createJWT(user)
            res.status(200).send(token);
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
    validBodyString("code"),
    errorsValidatorMiddleware,
    async (req, res) => {
        const {code} = req.body
        const checkConfirmationUser = await authService.registrationConfirmation(code as string)
        generators.messageRes({res,...checkConfirmationUser})
        }
    )

authRouter.post("/registration-email-resending",
    validBodyEmail('email',1,80,"notHave"),
    errorsValidatorMiddleware,
    async (req, res) => {
        const {email} = req.body
        const checkingEmail = await authService.resendingRegistrationEmail(email)
        generators.messageRes({res,...checkingEmail})
})
