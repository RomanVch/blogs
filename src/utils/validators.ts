import {body, param, query} from "express-validator";
import {blogsDbRepository} from "../repository/blogs-db-repository";

export const validBodyString = (field:string,min:number=1,max:number=30)=> body(field).isString().trim().isLength({min,max})
export const validQueryString = (field:string)=> {
    return query(field).optional().isString().trim()}
export const validQueryNumber = (field:string)=> {
    return query(field).optional().custom(valid=>{
        return Number.isInteger(+valid)}).toInt()
}
export const validQuerySortDirection = ()=> validQueryString('sortDirection')
    .custom(valid=>valid === 'asc' || valid === 'desc')


export const validBlogID = ()=> body("blogId").isString().trim().isLength({min:1,max:1000}).custom(async blogId => {
        const blog = await blogsDbRepository.getBlogId(blogId)
         if (!blog) throw new Error()
         return true
 })
export const validParamBlogID = ()=> param('id').isString().trim().isLength({min:1,max:1000}).custom(async blogId => {
    console.log(blogId)
    const blog = await blogsDbRepository.getBlogId(blogId)
    console.log(blog);
    if (!blog) throw new Error()
    return true
})
export const validUrl = (field:string,min:number=1,max:number=30,RegExp:RegExp)=> body(field).isString().trim().isLength({min,max}).matches(RegExp)