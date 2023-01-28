import {Request, Router} from "express";
import {
    validBodyEmail, validBodyLogin,
    validBodyString,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString,
} from "../utils/validators";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {usersService} from "../domain/users-service";
import {auth} from "../middlewares/auth";


const usersRouter = Router({});

export type UsersQueryT = {

        sortBy?:string,
        sortDirection?: "asc" | "desc",
        pageSize?:number,
        pageNumber?:number,
        searchLoginTerm?:string|null,
        searchEmailTerm?:string|null
}

usersRouter.get('/',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchLoginTerm'),
    validQueryString('searchEmailTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    async (req:Request<unknown,unknown,unknown,UsersQueryT>, res) => {
        const {pageSize=10,pageNumber=1,sortBy="createdAt",searchLoginTerm=null,searchEmailTerm=null,sortDirection='desc'} = req.query
        const query = {pageSize,pageNumber,sortBy,searchLoginTerm,searchEmailTerm,sortDirection};
        const users = await usersService.getUsers(query);
        if (users) {res.send(users)}
        else {res.status(404).send("Not found")}
    })

usersRouter.post('/',
    auth,
    validBodyLogin('login',3,10,'notHave'),
    validBodyString('password',6,20),
    validBodyEmail('email',1,100),
    errorsValidatorMiddleware,
    async (req, res) => {
            const {login,password,email} = req.body
            const newPost = await usersService.addUser({login,password,email})
            res.status(201).send(newPost.user);
    })

usersRouter.delete('/:id',auth,
    async (req, res) => {
        const id = req.params.id
        const checkBlog = await usersService.delUser(id)
        if (checkBlog) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })



export default usersRouter