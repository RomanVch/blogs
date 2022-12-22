import {client} from "./dataBase";
import {BlogsBaseT, BlogT, PostBaseT, PostT} from "./types";
import {ObjectId, WithId} from "mongodb";
import {log} from "util";

const blogDb = client.db("blogs").collection<BlogsBaseT>("blogs")

export const blogsDbRepository = {
    async getBlogs():Promise<WithId<BlogsBaseT>[]> {
        const blogs = await blogDb.find({}).toArray()
        return blogs
    },
        async getBlogId(id:string):Promise<WithId<BlogsBaseT>|false> {
        const blogs = await blogDb.findOne({_id: new ObjectId(id)})
            console.log(blogs)
            return blogs ? blogs : false

    },
    async addBlog(newBlogData:{name:string, description:string, websiteUrl:string}): Promise<BlogT>{
        const dateNow = new Date()
        const newBlog:BlogT = {
            name: newBlogData.name,
            description: newBlogData.description,
            websiteUrl: newBlogData.websiteUrl,
            createdAt:dateNow.toISOString()
        }
        await client.db('blogs').collection("blogs").insertOne(newBlog);
        return newBlog;
    },
    async correctBlog(correctBlogData:{ id:string,name:string, description:string, websiteUrl:string }):Promise<boolean> {
        const {id,description,websiteUrl,name}= correctBlogData
        const blog = await blogDb.updateOne({_id:new ObjectId(id)},{$set: {name,description,websiteUrl}})
        return blog.matchedCount === 1;
    },
    async delBlog(id:string){
        const result = await blogDb.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1;}
}

