import express from "express"
import bodyParser from "body-parser"
import {postRouter} from "./routers/postRouter";
import {blogsRouter} from "./routers/blogsRouter";
import {testingAllDataRouter} from "./routers/testingAllDataRouters";
export const app = express()
const port = 3000

const parserMiddleware = bodyParser();

app.use(parserMiddleware).use("/posts", postRouter).use("/blogs", blogsRouter).use("/testing/all-data",testingAllDataRouter)


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})