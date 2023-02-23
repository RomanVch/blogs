import  mongoose from "mongoose";
import * as dotenv from 'dotenv'
dotenv.config()

const mongoURL = process.env.mongoURL || 'mongodb://0.0.0.0:27017';

if(!mongoURL){
    throw new Error('! Url not found')
}

//export const client = new MongoClient(mongoURL.toString())


export async function runDb(){
    const dbName = 'blogs';
    try{
     await mongoose.connect(mongoURL+'/'+ dbName, {
         writeConcern: { w: 'majority' },
     })
         console.log("Connected successfully to mongo server")
    } catch (e) {
        console.log("can't connect to mongo server")
        await mongoose.disconnect();
    }
}