import {validationResult} from "express-validator";
import {Request, Response,NextFunction} from "express";
export const errorsValidatorMiddleware =(req:Request,res:Response,next:NextFunction) =>{
    const errors = validationResult(req); //onlyFirstError
    if (!errors.isEmpty()) {
        res.status(401).json({ "errorsMessages":[ ...errors.array()] });
    } else{
        next()
    }
}