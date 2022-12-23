import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {validBodyString, validUrl} from "../utils/validators";
import {auth} from "../middlewares/auth";
import {Router} from "express";
import {blogsDbRepository} from "../repository/blogs-db-repository";
import {WithId} from "mongodb";
import {BlogT} from "../repository/types";

const blogsRouter = Router({});


blogsRouter.get('/', async (req, res) => {
    const blogs = await blogsDbRepository.getBlogs()
    res.send(blogs.map((elemID:WithId<BlogT>)=>{
        return {id:elemID._id, name:elemID.name, description:elemID.description, websiteUrl:elemID.websiteUrl, createdAt:elemID.createdAt}
    }));
})

blogsRouter.get('/:id',
    errorsValidatorMiddleware,
 async (req, res) => {
        const blog = await blogsDbRepository.getBlogId(req.params.id)
        if(blog){
            const correctBlog={id:blog._id, name:blog.name, description:blog.description, websiteUrl:blog.websiteUrl, createdAt:blog.createdAt}
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
        const newPost = await blogsDbRepository.addBlog({name,description,websiteUrl})
        res.status(201).send(newPost);
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
        const post = await blogsDbRepository.correctBlog({id,name,description,websiteUrl})
        post ? res.sendStatus(204): res.sendStatus(404)
    })

blogsRouter.delete('/:id',auth,
  async (req, res) => {
        const id = req.params.id
        const chekBlog = await blogsDbRepository.delBlog(id)
        if (chekBlog) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })


export default blogsRouter