import { Router } from "express";
import { client } from "../repository/dataBase";
import {BlogT,PostT} from "../repository/types";

export const testingAllDataRouter = Router({});

const blogDb = client.db("blogs").collection<BlogT[]>("blogs")
const postDb = client.db("blogs").collection<PostT[]>("posts")

testingAllDataRouter.delete('/',
    async (req, res) => {
               await blogDb.deleteMany({})
               await postDb.deleteMany({})
                res.sendStatus(204)
    })
