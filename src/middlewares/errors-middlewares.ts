import {validationResult} from "express-validator";
import {Request, Response,NextFunction} from "express";
import {generators} from "../utils/generators";
export const errorsValidatorMiddleware =(req:Request,res:Response,next:NextFunction) =>{
    const errors = validationResult(req).array({ onlyFirstError: true }).map((item)=>{
        return {message:"If the inputModel has incorrect values",field:item.param}
    });
    if (errors.length) {
        generators.messageRes({res,code:errors[0].field === 'id'?404:400,body:[...errors]})
    } else{
        next()
    }
}
///
export const errorsValidatorAuthMiddleware =(req:Request,res:Response,next:NextFunction) => {
    console.log(validationResult(req).array({ onlyFirstError: true }));
    const errors = validationResult(req).array({ onlyFirstError: true }).length > 0 ? {message:"If the inputModel has incorrect values",field:"loginOrEmail | password",} :''
    if (errors) {
        generators.messageRes({res,code:401,body:[errors]})
    } else{
        next()
    }
}