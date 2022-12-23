import {client} from "./dataBase";
import {PostT} from "./types";
import {ObjectId, WithId} from "mongodb";

const postDb=client.db("blogs").collection<WithId<PostT>>("posts");

export const postInDbRepository = {
    async getPosts(): Promise<WithId<PostT>[]> {
        const posts = await postDb.find({}).toArray();
        return posts
    },
    async getPostId(id:string):Promise<WithId<PostT>|false> {
        const posts = await postDb.findOne({_id: new ObjectId(id)})
        return posts ? posts : false
    },
    async addPost(newPostData:{title:string, shortDescription:string, content:string,blogId:string}): Promise<WithId<PostT>> {
        const {title,shortDescription,content,blogId} = newPostData
        const dateNow = new Date()
        const newPost:PostT = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: newPostData.blogId + 'Name',
            createdAt:dateNow.toISOString()
        }
        await client.db('blogs').collection("posts").insertOne(newPost);
        return newPost as WithId<PostT>;
    },
    async correctPost(correctPostData:{id:string,title:string, shortDescription:string, content:string,blogId:string}):Promise<boolean>{
        const {id,title,shortDescription,content}= correctPostData
        const resultPost = await postDb.updateOne({_id:new ObjectId(id)},{$set: {title,shortDescription,content}})
        return resultPost.matchedCount === 1;
    },
    async delPost(id:string){
        const result = await postDb.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1;}
}

