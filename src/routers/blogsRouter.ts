import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {
    validBodyString,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString,
    validUrl
} from "../utils/validators";
import {auth} from "../middlewares/auth";
import {Router} from "express";
import { Request } from "express"
import {BlogMongoIdT, PostMongoIdT} from "../repository/types";
import {blogsService} from "../domain/blog-service";
import {mapper} from "../utils/mapper";
import {postService} from "../domain/post-service";

export type blogsQueryT = {
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
    async (req:Request<unknown,unknown,unknown,blogsQueryT>, res) => {
        const {pageSize=10,pageNumber=1,sortBy="creatAt",sortDirection='desc',searchNameTerm=null} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection,searchNameTerm};
        const blogs = await blogsService.getBlogs(query);
        res.send(blogs.map((elemID:BlogMongoIdT)=>mapper.getClientBlog(elemID)));
})

blogsRouter.get('/:id/posts',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchNameTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    async (req:Request<{ id: string},unknown,unknown,blogsQueryT>, res) => {
        const {pageSize=10,pageNumber=1,sortBy="creatAt",sortDirection='desc',searchNameTerm=null} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection,searchNameTerm};
        if(req.params.id){
            const posts = await blogsService.getBlogPosts(req.params.id,query);
            if (posts && posts.length > 0) {
                res.send(posts.map((post:PostMongoIdT)=>mapper.getClientPost(post)))
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

blogsRouter.post('/:id/post',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBodyString('title'),
    errorsValidatorMiddleware,
    async (req, res) => {
    const {title,shortDescription,content} = req.body
        console.log(2)
        const newPost = await postService.addPost({title,shortDescription,content,blogId:req.params.id})
        console.log(newPost)
        if(newPost){
            console.log(4)
            const correctPost = {id:newPost._id, title:newPost.title, blogId:newPost.blogId, blogName:newPost.blogName, content:newPost.content, shortDescription:newPost.shortDescription, createdAt:newPost.createdAt};
            res.status(201).send(correctPost);
        }else {
            console.log(1)
            res.sendStatus(404);
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