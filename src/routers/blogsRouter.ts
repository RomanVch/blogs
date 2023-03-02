import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {
    validBodyString, validParamBlogID,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString,
    validUrl
} from "../utils/validators";
import {auth} from "../middlewares/auth";
import {Router,Request,Response} from "express";
import {BlogService} from "../domain/blog-service";
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

class BlogsController {
    blogsService : BlogService;
    constructor() {
        this.blogsService = new BlogService;
    }
    async getBlogs(req:Request<unknown,unknown,unknown,BlogsQueryT>, res:Response) {
        const {pageSize=10,pageNumber=1,sortBy="createdAt",sortDirection='desc',searchNameTerm=null} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection,searchNameTerm};
        const blogs = await this.blogsService.getBlogs(query);
        if(blogs){res.send(blogs)}
        else {res.status(404)}
    }
    async getBlogPosts (req:Request<{ id: string},unknown,unknown,BlogsQueryT>, res:Response) {
    const {pageSize=10,pageNumber=1,sortBy="createdAt",sortDirection='desc',searchNameTerm=null} = req.query
    const query = {pageSize,pageNumber,sortBy,sortDirection,searchNameTerm};
    if(req.params.id){
        const posts = await this.blogsService.getBlogPosts(req.params.id,query);
    if (posts && posts.items.length > 0) {
        res.send(posts)
    }
    else {
        res.sendStatus(404);
        }
    }
    }
    async getBlogId (req:Request, res:Response)  {
    const blog = await this.blogsService.getBlogId(req.params.id)
    if(blog){
        const correctBlog = mapper.getClientBlog(blog)
        res.send(correctBlog)
    } else {
    res.sendStatus(404)
    }
}
    async addBlog (req:Request, res:Response)  {
        const {name,description,websiteUrl} = req.body
        const newPost = await this.blogsService.addBlog({name,description,websiteUrl})
        res.status(201).send(newPost);
    }
    async addPostInBlog (req:Request, res:Response) {
    const {title,shortDescription,content} = req.body
    const newPost = await postService.addPost({title,shortDescription,content,blogId:req.params.id})
        if (newPost) {
            const correctPost = {id:newPost._id, title:newPost.title, blogId:newPost.blogId, blogName:newPost.blogName, content:newPost.content, shortDescription:newPost.shortDescription, createdAt:newPost.createdAt};
            res.status(201).send(correctPost);
        } else {
            res.sendStatus(401);
        }
    }
    async editBlog (req:Request, res:Response) {
        const id = req.params.id;
        const {name,description,websiteUrl} = req.body
        const post = await this.blogsService.correctBlog({id,name,description,websiteUrl})
        post ? res.sendStatus(204): res.sendStatus(404)
}
    async deletBlog (req:Request, res:Response) {
    const id = req.params.id
    const chekBlog = await this.blogsService.delBlog(id)
    if (chekBlog) {
        res.sendStatus(204)
    } else {
    res.sendStatus(404)
}
}
}

const blogController = new BlogsController;

blogsRouter.get('/',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchNameTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    blogController.getBlogs.bind(blogController)
    )

blogsRouter.get('/:id/posts',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchNameTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    blogController.getBlogPosts.bind(blogController)
    )

blogsRouter.get('/:id',
    errorsValidatorMiddleware,
    blogController.getBlogId.bind(blogController)
    )

blogsRouter.post('/',
    auth,
    validBodyString('description',1,500),
    validBodyString('name',1,15),
    validUrl('websiteUrl',1,100,/(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/),
    errorsValidatorMiddleware,
    blogController.addBlog.bind(blogController)
    )

blogsRouter.post('/:id/posts',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBodyString('title'),
    validParamBlogID(),
    errorsValidatorMiddleware,
    blogController.addPostInBlog.bind(blogController)
    )

blogsRouter.put('/:id',
    auth,
    validBodyString('description',1,500),
    validUrl('websiteUrl',1,100,/(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/),
    validBodyString('name',1,15),
    errorsValidatorMiddleware,
    blogController.editBlog.bind(blogController)
    )
blogsRouter.delete('/:id',auth,
    blogController.deletBlog.bind(blogController)
)


export default blogsRouter