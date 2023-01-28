import { Router } from "express";
import { client } from "../repository/dataBase";
import {BlogT, PostT, UserMongoIdT} from "../repository/types";

export const testingAllDataRouter = Router({});

const blogDb = client.db("blogs").collection<BlogT[]>("blogs")
const postDb = client.db("blogs").collection<PostT[]>("posts")
const usersDb = client.db("blogs").collection<UserMongoIdT[]>("users")
const commentsDb = client.db("blogs").collection<UserMongoIdT[]>("comments")

testingAllDataRouter.delete('/',
    async (req, res) => {
               await blogDb.deleteMany({})
               await postDb.deleteMany({})
               await usersDb.deleteMany({})
               await commentsDb.deleteMany({})
                res.sendStatus(204)
    })
