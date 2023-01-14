import {client} from "./dataBase";
import {BlogMongoIdT, BlogSimpleIdT, BlogT, CorrectBlogT} from "./types";
import {ObjectId, WithId} from "mongodb";
import {BlogsQueryT, EndRouterT} from "../routers/blogsRouter";
import {mapper} from "../utils/mapper";

const blogDb = client.db("blogs").collection<BlogMongoIdT>("blogs")

export const blogsDbRepository = {
    async getBlogs(blogsQuery:BlogsQueryT):Promise<EndRouterT<BlogSimpleIdT[]>|null> {
        if(blogsQuery.pageNumber && blogsQuery.pageSize && blogsQuery.sortBy && blogsQuery.sortDirection){
            const skip = (blogsQuery.pageNumber -1) * blogsQuery.pageSize;
            const direction = blogsQuery.sortDirection === "desc"? -1 : 1;
            if(!blogsQuery.sortDirection) return null
            console.log({[blogsQuery.sortBy]:direction})
            const regex = new RegExp(`${blogsQuery.searchNameTerm}`, "i");
            const blogs = await blogDb
                .find({name:blogsQuery.searchNameTerm ? {$regex:regex}:new RegExp('', 'g') })
                .skip(skip)
                .limit(blogsQuery.pageSize)
                .sort({[blogsQuery.sortBy]:direction})
                .toArray()
            const blogsCount = await blogDb.countDocuments();
            return {
                pagesCount: Math.ceil(blogsCount / blogsQuery.pageSize),
                page: blogsQuery.pageNumber,
                pageSize: blogsQuery.pageSize,
                totalCount: blogsCount,
                items: blogs.map((blog) => mapper.getClientBlog(blog))
            };
        }

        return null
    },
        async getBlogId(id:string):Promise<WithId<BlogT>|null> {
        return  blogDb.findOne({_id: new ObjectId(id)})
    },
    async addBlog(newBlog:BlogT): Promise<BlogSimpleIdT>{
        const result = await client.db('blogs').collection("blogs").insertOne(newBlog);
        return {
            id:result.insertedId.toString(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt:newBlog.createdAt
        };
    },
    async correctBlog(correctBlog:CorrectBlogT):Promise<boolean> {
        const {id,description,websiteUrl,name}= correctBlog
        const blog = await blogDb.updateOne({_id:new ObjectId(id)},{$set: {name,description,websiteUrl}})
        return blog.matchedCount === 1;
    },
    async delBlog(id:string){
        const result = await blogDb.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1;}
}

