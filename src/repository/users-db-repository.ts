import { client } from "./dataBase";
import { UserForBaseIdT, UserMongoIdT, UserSimpleIdT } from "./types";
import { EndRouterT } from "../routers/blogsRouter";
import { mapper } from "../utils/mapper";
import { UsersQueryT } from "../routers/usersRouter";
import { ObjectId } from "mongodb";

const usersDb = client.db("blogs").collection<UserMongoIdT>("users")

export const usersDbRepository = {
    async getUsers(usersQuery:UsersQueryT):Promise<EndRouterT<UserSimpleIdT[]>|null> {
        if(usersQuery.pageNumber && usersQuery.pageSize && usersQuery.sortBy){
            const skip = (usersQuery.pageNumber -1) * usersQuery.pageSize;
            const direction = usersQuery.sortDirection === "desc"? -1 : 1;
            const getRegex = (name:string|undefined|null) => {
                if(name){
                    return new RegExp(`${name}`, "i")}
                return new RegExp(``, "i")
                }
            const users = await usersDb
                .find({$or: [{login: getRegex(usersQuery.searchLoginTerm)}, {email: getRegex(usersQuery.searchEmailTerm )}]})
                .skip(skip)
                .limit(usersQuery.pageSize)
                .sort({[usersQuery.sortBy]:direction})
                .toArray()
            const blogsCount = await usersDb
                .find({$or: [{login: getRegex(usersQuery.searchLoginTerm)}, {email: getRegex(usersQuery.searchEmailTerm )}]})
                .count();

            console.log(users,blogsCount)
            return {
                pagesCount: Math.ceil(blogsCount / usersQuery.pageSize),
                page: usersQuery.pageNumber,
                pageSize: usersQuery.pageSize,
                totalCount: blogsCount,
                items: users.map((user) => mapper.getUserPost(user))
            };
        }

        return null
    },
    async getUserLogin(login:string):Promise<UserMongoIdT|null> {
        return  usersDb.findOne({login})
    },
    async getUserEmail(email:string):Promise<UserMongoIdT|null> {
        return  usersDb.findOne({email})
    },
    async getUserByLoginOrEmail(loginOrEmail:string):Promise<UserMongoIdT|null> {
        return  usersDb.findOne({$or: [{login: loginOrEmail}, {email: loginOrEmail}]})
    },

    async addUser(newUser:UserForBaseIdT): Promise<UserSimpleIdT>{
        const result = await client.db('blogs').collection('users').insertOne(newUser);
        return {
            id:result.insertedId.toString(),
            login: newUser.login,
            email: newUser.email,
            createdAt: newUser.createdAt,
        };
    },
    async delUser(id:string) {
        const result = await usersDb.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1;}
}

