import {Router} from "express";
import {dataBase} from "../repository/dataBase";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {validBodyString, validUrl} from "../utils/validators";
import {blogsRepository} from "../repository/blogsRepository";
import {auth} from "../middlewares/auth";
export {dataBase} from "../repository/dataBase.js"

export const blogsRouter = Router({});

blogsRouter.get('/', (req, res) => {
    res.send(dataBase.blogs);
})

blogsRouter.post('/',
    auth,
    validBodyString('description',1,500),
    validBodyString('name',1,15),
    validUrl('websiteUrl',1,100,/(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/),
    errorsValidatorMiddleware,
    (req, res) => {
        const {name,description,websiteUrl} = req.body
        const newPost = blogsRepository.addBlog({name,description,websiteUrl})
        res.status(201).send(newPost);
    })
blogsRouter.get('/:id',
    errorsValidatorMiddleware,
    (req, res) => {
        const blog = dataBase.blogs.find((blog)=>blog.id === req.params.id)
        blog ? res.send(blog) : res.sendStatus(404)
    })

blogsRouter.put('/:id',
    auth,
    validBodyString('description',1,500),
    validUrl('websiteUrl',1,100,/(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/),
    validBodyString('name',1,15),
    errorsValidatorMiddleware,
    (req, res) => {
        const id = req.params.id;
        const {name,description,websiteUrl} = req.body
        const post = blogsRepository.correctBlog({id,name,description,websiteUrl})
        post ? res.sendStatus(204): res.sendStatus(404)
    })

blogsRouter.delete('/:id',auth,
    (req, res) => {
        const id = req.params.id
        const chekBlog =blogsRepository.delBlog(id)
        if(chekBlog){
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })
