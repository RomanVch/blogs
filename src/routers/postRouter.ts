import { Router } from "express";
import { dataBase } from "../repository/dataBase";
import { errorsValidatorMiddleware } from "../middlewares/errors-middlewares";;
import { postRepository } from "../repository/postRepository";
import { validBodyString } from "../utils/validators";
import { auth } from "../middlewares/auth";

export const postRouter = Router({});

postRouter.get('/', (req, res) => {
        res.send(dataBase.posts)
})

postRouter.post('/',
    auth,
    validBodyString('title'),
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBodyString('blogId',1,1000),
    errorsValidatorMiddleware,
    (req, res) => {
    const {title,shortDescription,content,blogId} = req.body
    const newPost = postRepository.addPost({title,shortDescription,content,blogId})
        res.status(201).send(newPost);
})

postRouter.get('/:id',
    (req, res) => {
    const post = dataBase.posts.find((post)=>post.id === req.params.id)
        post ? res.send(post) : res.sendStatus(404)
})


postRouter.put('/:id',
    auth,
    validBodyString('title'),
    validBodyString('shortDescription',1,100),
    validBodyString('content',1,1000),
    validBodyString('blogId',1,1000),
    errorsValidatorMiddleware, (req, res) => {
    const id = req.params.id;
    const {title,shortDescription,content,blogId} = req.body
        const post = postRepository.correctPost({id,title,shortDescription,content,blogId})
        post ? res.sendStatus(204): res.sendStatus(404)
})


postRouter.delete('/:id',auth,
    (req, res) => {
    const id = req.params.id
        const chekPost =postRepository.delPost(id)
    if(chekPost){
        res.sendStatus(204)
    } else {
         res.sendStatus(404)
        }
})
