import {Request, Router, Response} from "express";
import {
    validBodyEmail, validBodyLogin,
    validBodyString,
    validQueryNumber,
    validQuerySortDirection,
    validQueryString,
} from "../utils/validators";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import { UsersService } from "../domain/users-service";
import {auth} from "../middlewares/auth";
import {usersDbRepository} from "../repository/users-db-repository";


const usersRouter = Router({});

export type UsersQueryT = {
        sortBy?:string,
        sortDirection?: "asc" | "desc",
        pageSize?:number,
        pageNumber?:number,
        searchLoginTerm?:string|null,
        searchEmailTerm?:string|null
}

class usersController {
    usersService: UsersService;
    constructor() {
        this.usersService = new UsersService(usersDbRepository);
    }
    async getUsers (req:Request<unknown,unknown,unknown,UsersQueryT>, res:Response) {
        const {pageSize=10,pageNumber=1,sortBy="createdAt",searchLoginTerm=null,searchEmailTerm=null,sortDirection='desc'} = req.query
        const query = {pageSize,pageNumber,sortBy,searchLoginTerm,searchEmailTerm,sortDirection};
        const users = await this.usersService.getUsers(query);
        if (users) {res.send(users)}
        else {res.status(404).send("Not found")}
}
    async addUser (req:Request, res:Response):Promise<any> {
        const  {login,password,email} = req.body
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const userAgent = req.headers['user-agent']
        if(!ip || !userAgent){ return res.sendStatus(400) }
        const newPost = await this.usersService.addUser({login,password,email,userAgent,ip:ip as string})
        res.status(201).send(newPost.user);
}
    async delUser (req:Request, res:Response):Promise<any> {
    const id = req.params.id
    const checkBlog = await this.usersService.delUser(id)
    if (checkBlog) {
        res.sendStatus(204)
    } else {
    res.sendStatus(404)
}
}


}

const usersControllerInstans = new usersController;

usersRouter.get('/',
    validQueryNumber('pageSize'),
    validQueryNumber('pageNumber'),
    validQueryString('sortBy'),
    validQueryString('searchLoginTerm'),
    validQueryString('searchEmailTerm'),
    validQuerySortDirection(),
    errorsValidatorMiddleware,
    usersControllerInstans.getUsers.bind(usersControllerInstans)
    )

usersRouter.post('/',
    auth,
    validBodyLogin('login',3,10,'notHave'),
    validBodyString('password',6,20),
    validBodyEmail('email',1,100),
    errorsValidatorMiddleware,
    usersControllerInstans.getUsers.bind(usersControllerInstans)
    )

usersRouter.delete('/:id',auth,
    usersControllerInstans.delUser.bind(usersControllerInstans)
)



export default usersRouter