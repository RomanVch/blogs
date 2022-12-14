import {validationResult} from "express-validator";
import {Request, Response,NextFunction} from "express";
export const errorsValidatorMiddleware =(req:Request,res:Response,next:NextFunction) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ "errorsMessages":[ ...errors.array()] });
    } else{
        next()
    }
}