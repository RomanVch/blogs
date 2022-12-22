import { Router } from "express";
import { errorsValidatorMiddleware } from "../middlewares/errors-middlewares";;
import { postInDbRepository } from "../repository/post-in-db-repository";
import {validBlogID, validBodyString} from "../utils/validators";
import { auth } from "../middlewares/auth";
import {dataBase} from "../repository/dataBase";

const postRouter = Router({});

postRouter.get('/', async(req, res) => {
    const posts = await postInDbRepository.getPosts()
    res.send(posts)
})

postRouter.get('/:id',
    async (req, res) => {
        const id = req.params.id;
        const post = await postInDbRepository.getPostId(id)
        post ? res.send(post) : res.sendStatus(404)
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
        res.status(201).send(newPost);
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