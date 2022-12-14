import express from "express"
import bodyParser from "body-parser"
import postRouter from "./routers/postRouter";
import blogsRouter from "./routers/blogsRouter";
import {testingAllDataRouter} from "./routers/testingAllDataRouters";
import {runDb} from "./repository/dataBase";

export const app = express()
const port = 3003

const parserMiddleware = bodyParser.json();

app.use(parserMiddleware)
    .use("/posts", postRouter)
    .use("/blogs", blogsRouter)
    .use("/testing/all-data",testingAllDataRouter)


app.listen(port, async () => {
    await runDb()
    console.log(`Example app listening on port ${port}`)
})