import { Router } from "express";
import { client } from "../repository/dataBase";
import {BlogsBaseT} from "../repository/types";

export const testingAllDataRouter = Router({});

const blogDb = client.db("blogs").collection<BlogsBaseT>("blogs")
const postDb = client.db("blogs").collection<BlogsBaseT>("posts")

testingAllDataRouter.delete('/',
    async (req, res) => {
               await blogDb.deleteMany({})
               await postDb.deleteMany({})
                res.sendStatus(204)
    })
