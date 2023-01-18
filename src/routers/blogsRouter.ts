import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {
    validBodyString, validParamBlogID,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString,
    validUrl
} from "../utils/validators";
import {auth} from "../middlewares/auth";
import {Router} from "express";
import { Request } from "express"
import {blogsService} from "../domain/blog-service";
import {mapper} from "../utils/mapper";
import {postService} from "../domain/post-service";

export type PageInfoT = {
    pagesCount: number,
        page: number,
    pageSize: number,
    totalCount: number,
}

export type EndRouterT<T>  = PageInfoT & {
    items: T
}

export type BlogsQueryT = {
    searchNameTerm?:string|null,
    sortBy?:string,
    sortDirection?: "asc" | "desc",
    pageSize?:number,
    pageNumber?:number
}

const blogsRouter = Router({});

blogsRouter.get('/',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchNameTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    async (req:Request<unknown,unknown,unknown,BlogsQueryT>, res) => {
        const {pageSize=10,pageNumber=1,sortBy="createdAt",sortDirection='desc',searchNameTerm=null} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection,searchNameTerm};
        const blogs = await blogsService.getBlogs(query);
        if(blogs){res.send(blogs)}
        else {res.status(404)}

})

blogsRouter.get('/:id/posts',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchNameTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    async (req:Request<{ id: string},unknown,unknown,BlogsQueryT>, res) => {
        const {pageSize=10,pageNumber=1,sortBy="createdAt",sortDirection='desc',searchNameTerm=null} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection,searchNameTerm};
        if(req.params.id){
            const posts = await blogsService.getBlogPosts(req.params.id,query);
            if (posts && posts.items.length > 0) {
                res.send(posts)
            }
            else {
                res.sendStatus(404);
            }
        }
    })

blogsRouter.get('/:id',
    errorsValidatorMiddleware,
 async (req, res) => {
        const blog = await blogsService.getBlogId(req.params.id)
        if(blog){
            const correctBlog = mapper.getClientBlog(blog)
                res.send(correctBlog)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.post('/',
    auth,
    validBodyString('description',1,500),
    validBodyString('name',1,15),
    validUrl('websiteUrl',1,100,/(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/),
    errorsValidatorMiddleware,
   async (req, res) => {
        const {name,description,websiteUrl} = req.body
        const newPost = await blogsService.addBlog({name,description,websiteUrl})
        res.status(201).send(newPost);
    })

blogsRouter.post('/:id/posts',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBodyString('title'),
    validParamBlogID(),
    errorsValidatorMiddleware,
    async (req, res) => {
    const {title,shortDescription,content} = req.body
        /*console.log(!req.params.id)*/
/*if(!req.params.id?.trim()){
            console.log("CATCH")
            return res.status(400).send({
            errorsMessages: [
                {
                    message: "blogId is required",
                    field: "param blogId"
                }
            ]
        });}*/
        const newPost = await postService.addPost({title,shortDescription,content,blogId:req.params.id})
        if(newPost){
            const correctPost = {id:newPost._id, title:newPost.title, blogId:newPost.blogId, blogName:newPost.blogName, content:newPost.content, shortDescription:newPost.shortDescription, createdAt:newPost.createdAt};
            res.status(201).send(correctPost);
        }else {
            res.sendStatus(401);
        }
    })

blogsRouter.put('/:id',
    auth,
    validBodyString('description',1,500),
    validUrl('websiteUrl',1,100,/(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/),
    validBodyString('name',1,15),
    errorsValidatorMiddleware,
    async (req, res) => {
        const id = req.params.id;
        const {name,description,websiteUrl} = req.body
        const post = await blogsService.correctBlog({id,name,description,websiteUrl})
        post ? res.sendStatus(204): res.sendStatus(404)
    })
blogsRouter.delete('/:id',auth,
  async (req, res) => {
        const id = req.params.id
        const chekBlog = await blogsService.delBlog(id)
        if (chekBlog) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })


export default blogsRouter