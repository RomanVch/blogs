import { Router } from "express";
import {blogsModel, commentsModel, infoBackModel, postsModel, usersModel} from "../repository/Schemas";

export const testingAllDataRouter = Router({});

const blogDb = blogsModel
const postDb = postsModel
const usersDb = usersModel
const commentsDb = commentsModel
const infoBackDb = infoBackModel
testingAllDataRouter.delete('/',
    async (req, res) => {
               await blogDb.deleteMany({})
               await postDb.deleteMany({})
               await usersDb.deleteMany({})
               await commentsDb.deleteMany({})
               await infoBackDb.deleteMany({})
                res.sendStatus(204)
    })
