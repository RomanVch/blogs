import {dataBase} from "../repository/dataBase";
import {body} from "express-validator";
export {dataBase} from "../repository/dataBase.js"

export const validBodyString = (field:string,min:number=1,max:number=30)=> body(field).isString().trim().isLength({min,max})
export const validBlogID = ()=> body("blogId").isString().trim().isLength({min:1,max:1000}).custom(blogId => {
        const blog =  dataBase.blogs.find((blog)=>blog.id === blogId)
         if (!blog) throw new Error()
         return true
 })
export const validUrl = (field:string,min:number=1,max:number=30,RegExp:RegExp)=> body(field).isString().trim().isLength({min,max}).matches(RegExp)