import {body, param, query} from "express-validator";
import {blogsDbRepository} from "../repository/blogs-db-repository";
import {usersDbRepository} from "../repository/users-db-repository";
import {blogsService} from "../domain/blog-service";
import {postService} from "../domain/post-service";
import {commentsService} from "../domain/comments-service";

export const validBodyString = (field:string,min:number=1,max:number=30)=> body(field).isString().trim().isLength({min,max})
export const validQueryString = (field:string) => {
    return query(field).optional().isString().trim()
}
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
    const blog = await blogsService.getBlogId(blogId)
    if (!blog) throw new Error()
    return true
})

export const validParamPostId = ()=> param('id').isString().trim().isLength({min:1,max:1000}).custom(async postId => {
    const post = await postService.getPostId(postId);
    if (!post) throw new Error()
    return true
})
export const validParamCommentId = ()=> param('id').isString().trim().isLength({min:1,max:1000}).custom(async commentId => {
    const comment = await commentsService.getCommentById(commentId);
    if (!comment) throw new Error()
    return true
})
export const validUrl = (field:string,min:number=1,max:number=30,RegExp:RegExp)=> body(field).isString().trim().isLength({min,max}).matches(RegExp)

export const validBodyEmail = (field:string,min:number=1,max:number=30,howCheckLogin:"have"|"notHave"='have')=> body(field).isString().trim().isLength({min,max}).isEmail().custom(async (email:string)=>{
    const emailCheck = await usersDbRepository.getUserEmail(email)
    if (howCheckLogin === "notHave"?!emailCheck:emailCheck) throw new Error()
    return true
})
export const validResentBodyEmail = (field:string,min:number=1,max:number=90)=> body(field).isString().trim().isLength({min,max}).isEmail().custom(async (email:string)=>{
    const emailCheck = await usersDbRepository.getUserEmail(email)
    if(emailCheck && emailCheck?.emailConfirmation.isConfirmed) throw new Error()
    return true
})

export const validBodyLogin = (field:string,min:number=1,max:number=30,howCheckLogin:"have"|"notHave")=> body(field).isString().trim().isLength({min,max}).custom(async (login:string)=>{
    const loginCheck = await usersDbRepository.getUserLogin(login)
    if (howCheckLogin === "have"?!loginCheck:loginCheck) throw new Error()
    return loginCheck
})

export const validLoginOrEmail = (min:number=1,max:number=30,howCheckLogin:"have"|"notHave")=> {
    return body('loginOrEmail').isString().trim().isLength({min, max}).custom(async (login: string) => {
        const loginCheck = await usersDbRepository.getUserLogin(login)
        if (howCheckLogin === "have" ? !loginCheck : loginCheck) throw new Error()
        return loginCheck
    });
}

