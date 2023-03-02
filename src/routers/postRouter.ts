import {Request, Router, Response} from "express";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {
    validBlogID,
    validBodyString,
    validParamPostId,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString
} from "../utils/validators";
import {auth} from "../middlewares/auth";
import {PostService} from "../domain/post-service";
import {mapper} from "../utils/mapper";
import {commentsService} from "../domain/comments-service";
import {authJwt} from "../middlewares/authJwt";
import {usersService} from "../domain/users-service";
import {ObjectId} from "mongodb";

export type PostsQueryT = {
    sortBy?:string,
    sortDirection?:string,
    pageSize?:number,
    pageNumber?:number
}

export const postRouter = Router();
class PostsController {
    postService: PostService;
    constructor() {
        this.postService = new PostService;
    }

    async getPost (req: Request<unknown,unknown,unknown,PostsQueryT>, res:Response):Promise<any> {
        const { pageSize=10, pageNumber=1, sortBy="createdAt", sortDirection='desc'} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection};
        const posts = await this.postService.getPosts(query)
        if(!posts)  return res.sendStatus(404);
        res.send(posts)
    }
    async getPostId (req:Request, res:Response):Promise<any> {
    const id = req.params.id;
    const post = await this.postService.getPostId(id)
    if (post) {
        const correctPost = mapper.getClientPost(post)
        res.send(correctPost)
    } else {
    res.sendStatus(404)
}
}
    async getCommentPost (req:Request, res:Response):Promise<any> {
    const id = req.params.id;
    const post = await this.postService.getPostId(id)
    if (post) {
        const correctPost = mapper.getClientPost(post)
        res.send(correctPost)
    } else {
    res.sendStatus(404)
}
}
    async addPost (req:Request, res:Response) {
    const {title,shortDescription,content,blogId} = req.body
    const newPost = await this.postService.addPost({title,shortDescription,content,blogId})
    if(newPost){
        const correctPost = {id:newPost._id, title:newPost.title, blogId:newPost.blogId, blogName:newPost.blogName, content:newPost.content, shortDescription:newPost.shortDescription, createdAt:newPost.createdAt};
        res.status(201).send(correctPost);
    } else {
        res.sendStatus(404)
}
}

async addCommentInPost (req:Request, res:Response) {
    const {content} = req.body
    const user = await usersService.getUserById(new ObjectId(req.user!.id))
    if (user) {
        const newComment = await commentsService.addComment(user,content,req.params.id);
        res.status(201).send(newComment);
    } else {
        res.sendStatus(401);
    }
}
    async editComment (req:Request, res:Response) {
    const id = req.params.id;
    const {title,shortDescription,content,blogId} = req.body
const post = await this.postService.correctPost({id,title,shortDescription,content,blogId})
post ? res.sendStatus(204): res.sendStatus(404)
}

    async deleteComment (req:Request, res:Response) {
    const id = req.params.id
    const checkPost = await this.postService.delPost(id)
    if(checkPost){
        res.sendStatus(204)
    } else {
    res.sendStatus(404)
}
}

}

const postsControllerInstance = new PostsController;

postRouter.get('/',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    postsControllerInstance.getPost.bind(postsControllerInstance)
    )

postRouter.get('/:id',
    postsControllerInstance.getPostId.bind(postsControllerInstance)
    )

postRouter.get('/:id/comments',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchNameTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    postsControllerInstance.getCommentPost.bind(postsControllerInstance)
    )
postRouter.post('/',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBlogID(),
    validBodyString('title'),
    errorsValidatorMiddleware,
    postsControllerInstance.addPost.bind(postsControllerInstance)
    )
postRouter.post('/:id/comments',
    authJwt,
    validBodyString('content',20,300),
    validParamPostId(),
    errorsValidatorMiddleware,
    postsControllerInstance.addCommentInPost.bind(postsControllerInstance)
    )
postRouter.put('/:id',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,300),
    validBlogID(),
    validBodyString('title'),
    errorsValidatorMiddleware,
    postsControllerInstance.editComment.bind(postsControllerInstance)
)

postRouter.delete('/:id',
    auth,
    postsControllerInstance.deleteComment.bind(postsControllerInstance)
)
