import { Router } from "express";
import { errorsValidatorMiddleware } from "../middlewares/errors-middlewares";;
import { postInDbRepository } from "../repository/post-in-db-repository";
import {validBlogID, validBodyString} from "../utils/validators";
import { auth } from "../middlewares/auth";
import {WithId} from "mongodb";
import {BlogT, PostT} from "../repository/types";

const postRouter = Router({});

postRouter.get('/', async(req, res) => {
    const posts = await postInDbRepository.getPosts()
    res.send(posts.map((elemID:WithId<PostT>)=>{
        return {
            id:elemID._id,
            title:elemID.title,
            shortDescription:elemID.shortDescription,
            content:elemID.content,
            createdAt:elemID.createdAt,
            blogId:elemID.blogId,
            blogName:elemID.blogName
        }
    }))
})

postRouter.get('/:id',
    async (req, res) => {
        const id = req.params.id;
        const post = await postInDbRepository.getPostId(id)
        if (post) {
            const correctPost = {
                id: post._id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                createdAt: post.createdAt,
                blogId: post.blogId,
                blogName: post.blogName
            }
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
    const newPost = await postInDbRepository.addPost({title,shortDescription,content,blogId})
     const correctPost = {id:newPost._id, title:newPost.title, blogId:newPost.blogId, blogName:newPost.blogName, content:newPost.content, shortDescription:newPost.shortDescription, createdAt:newPost.createdAt};
     res.status(201).send(correctPost);
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
        const post = await postInDbRepository.correctPost({id,title,shortDescription,content,blogId})
        post ? res.sendStatus(204): res.sendStatus(404)
})

postRouter.delete('/:id',auth,
    async (req, res) => {
    const id = req.params.id
        const chekPost = await postInDbRepository.delPost(id)
    if(chekPost){
        res.sendStatus(204)
    } else {
         res.sendStatus(404)
        }
})

export default postRouter