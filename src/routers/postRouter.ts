import {Request, Router} from "express";
import { errorsValidatorMiddleware } from "../middlewares/errors-middlewares";;

import {
    validBlogID,
    validBodyString,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString
} from "../utils/validators";
import { auth } from "../middlewares/auth";
import {WithId} from "mongodb";
import {PostT} from "../repository/types";
import {postService} from "../domain/post-service";
import {mapper} from "../utils/mapper";

export type PostsQueryT = {
    sortBy?:string,
    sortDirection?:string,
    pageSize?:number,
    pageNumber?:number
}

const postRouter = Router({});

postRouter.get('/',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    async(req: Request<unknown,unknown,unknown,PostsQueryT>, res) => {
        const { pageSize=10, pageNumber=1, sortBy="creatAt", sortDirection='desc'} = req.query
        const query = {pageSize,pageNumber,sortBy,sortDirection};
        const posts = await postService.getPosts(query)
        res.send(posts.map((elemID:WithId<PostT>)=>{
        return mapper.getClientPost(elemID)
    }))
})

postRouter.get('/:id',
    async (req, res) => {
        const id = req.params.id;
        const post = await postService.getPostId(id)
        if (post) {
            const correctPost = mapper.getClientPost(post)
            res.send(correctPost)
        } else {
            res.sendStatus(404)
        }
    })

postRouter.post('/',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBlogID(),
    validBodyString('title'),
    errorsValidatorMiddleware,
 async (req, res) => {
    const {title,shortDescription,content,blogId} = req.body
    const newPost = await postService.addPost({title,shortDescription,content,blogId})
     if(newPost){
         const correctPost = {id:newPost._id, title:newPost.title, blogId:newPost.blogId, blogName:newPost.blogName, content:newPost.content, shortDescription:newPost.shortDescription, createdAt:newPost.createdAt};
         res.status(201).send(correctPost);
     } else {
         res.sendStatus(404)
     }
})

postRouter.put('/:id',
    auth,
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBlogID(),
    validBodyString('title'),
    errorsValidatorMiddleware,
    async (req, res) => {
    const id = req.params.id;
    const {title,shortDescription,content,blogId} = req.body
        const post = await postService.correctPost({id,title,shortDescription,content,blogId})
        post ? res.sendStatus(204): res.sendStatus(404)
})

postRouter.delete('/:id',auth,
    async (req, res) => {
    const id = req.params.id
        const chekPost = await postService.delPost(id)
    if(chekPost){
        res.sendStatus(204)
    } else {
         res.sendStatus(404)
        }
})

export default postRouter