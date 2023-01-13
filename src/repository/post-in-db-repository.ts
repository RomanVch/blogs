import {client} from "./dataBase";
import {PostMongoIdT, PostT} from "./types";
import {ObjectId} from "mongodb";
import {PostsQueryT} from "../routers/postRouter";
import {BlogsQueryT} from "../routers/blogsRouter";

export const postDb=client.db("blogs").collection<PostMongoIdT>("posts");

export const postInDbRepository = {
    async getPosts(postQuery:PostsQueryT): Promise<PostMongoIdT[]> {
        if(postQuery.pageNumber && postQuery.pageSize){
            const skip = (postQuery.pageNumber -1) * postQuery.pageSize;
            return postDb.find({}).skip(skip).limit(postQuery.pageSize).toArray()
        }
        return []
    },
    async getPostsBlog(blogId:string, blogsQuery:BlogsQueryT):Promise<PostMongoIdT[]> {
        if(blogsQuery.pageNumber && blogsQuery.pageSize) {
            const skip = (blogsQuery.pageNumber - 1) * blogsQuery.pageSize;
            return postDb.find({blogId}).skip(skip).limit(blogsQuery.pageSize).toArray();
        }
        return []
        },
    async getPostId(id:string):Promise<PostMongoIdT|null> {
        return postDb.findOne({_id: new ObjectId(id)})
    },
    async addPost(newPostData:PostT): Promise<PostMongoIdT|null> {
        const blog = await client.db('blogs').collection("blog").find({_id: newPostData.blogId});
        console.log(blog,111111);
        if (blog){
            await client.db('blogs').collection("posts").insertOne(newPostData);
            return newPostData as PostMongoIdT;
        }
        return null
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

