import { Router } from "express";
import { dataBase } from "../repository/dataBase";

export const testingAllDataRouter = Router({});

testingAllDataRouter.delete('/',
    (req, res) => {
                dataBase.posts=[]
                dataBase.blogs=[]
                res.sendStatus(204)
    })
