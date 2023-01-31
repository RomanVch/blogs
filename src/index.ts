import express from "express"
import bodyParser from "body-parser"
import cookieParser from  "cookie-parser"
import postRouter from "./routers/postRouter";
import blogsRouter from "./routers/blogsRouter";
import {testingAllDataRouter} from "./routers/testingAllDataRouters";
import {runDb} from "./repository/dataBase";
import usersRouter from "./routers/usersRouter";
import {authRouter} from "./routers/authRouter";
import {commentsRouter} from "./routers/commentsRouter";

export const app = express()
const port = 3003

const parserMiddleware = bodyParser.json();

app.use(parserMiddleware)
    .use(cookieParser())
    .use("/posts", postRouter)
    .use("/blogs", blogsRouter)
    .use("/users", usersRouter)
    .use("/auth", authRouter)
    .use("/comments", commentsRouter)
    .use("/testing/all-data",testingAllDataRouter)


app.listen(port, async () => {
    await runDb()
    console.log(`Example app listening on port ${port}`)
})