import express from "express"
import {runDb} from "./repository/dataBase";
import {app, port} from "./initApp";


const startApp = async () => {
    await runDb()
    app.listen(port, async () => {
        console.log(`Example app listening on port ${port}`)
    })
}

startApp()