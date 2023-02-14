import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {postRouter} from "./routers/postRouter";
import blogsRouter from "./routers/blogsRouter";
import usersRouter from "./routers/usersRouter";
import {authRouter} from "./routers/authRouter";
import {commentsRouter} from "./routers/commentsRouter";
import {securityDevicesRouter} from "./routers/securityDevicesRouter";
import {testingAllDataRouter} from "./routers/testingAllDataRouters";
import cors from "cors";
export const app = express()
export const port = 3003

const parserMiddleware = bodyParser.json();


app.use(parserMiddleware)
app.use(cors())
app.use(cookieParser())
app.set('trust proxy', true)
app.use("/posts", postRouter)
app.use("/blogs", blogsRouter)
app.use("/users", usersRouter)
app.use("/auth", authRouter)
app.use("/comments", commentsRouter)
app.use("/security", securityDevicesRouter)
app.use("/testing/all-data",testingAllDataRouter)