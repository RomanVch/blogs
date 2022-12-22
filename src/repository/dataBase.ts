import {DataBaseT} from "./types";
import {MongoClient} from "mongodb";
import * as dotenv from 'dotenv'
dotenv.config()

const mongoURL = process.env.mongoURL || 'mongodb://0.0.0.0:27017';

if(!mongoURL){
    throw new Error('! Url not found')
}

export const client = new MongoClient(mongoURL.toString())

export async function runDb(){
    try{
        await client.connect()
        await client.db('blogs').command({ping:1})
        console.log("Connected successfully to mongo server")
    } catch (e) {
        console.log("can't connect to mongo server")
        await client.close()
    }
}

export const dataBase:DataBaseT = {
    blogs:[],
    posts:[],
}