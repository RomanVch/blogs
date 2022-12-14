import {dataBase} from "../repository/dataBase";
import {body} from "express-validator";
import {blogsRepository} from "../repository/blogsRepository";
export {dataBase} from "../repository/dataBase.js"

export const validBodyString = (field:string,min:number=1,max:number=30)=> body(field).isString().trim().isLength({min,max}).withMessage({message:"If the inputModel has incorrect values",field})
export const validUrl = (field:string,min:number=1,max:number=30,RegExp:RegExp)=> body(field).isString().trim().isLength({min,max}).matches(RegExp).withMessage({message:"If the inputModel has incorrect values",field})