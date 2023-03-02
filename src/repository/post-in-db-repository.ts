import {PostMongoIdT, PostSimpleIdT, PostT} from "./types";
import {ObjectId} from "mongodb";
import {PostsQueryT} from "../routers/postRouter";
import {BlogsQueryT, EndRouterT} from "../routers/blogsRouter";
import {mapper} from "../utils/mapper";
import {postsModel} from "./Schemas";

export const postDb= postsModel //client.db("blogs").collection<PostMongoIdT>("posts");

export class PostInDbRepository {
    async getPosts(postQuery:PostsQueryT): Promise<EndRouterT<PostSimpleIdT[]>|null> {
        if(postQuery.pageNumber && postQuery.pageSize){
            const skip = (postQuery.pageNumber -1) * postQuery.pageSize;
            const direction = postQuery.sortDirection === "desc"? -1 : 1;
            if(!postQuery.sortBy)return null;

            const posts = await postDb.find({})
                .skip(skip)
                .limit(postQuery.pageSize)
                .sort({[postQuery.sortBy]:direction})

            const postsCount = await postDb.estimatedDocumentCount();
            return {
                pagesCount: Math.ceil(postsCount / postQuery.pageSize),
                page: postQuery.pageNumber,
                pageSize: postQuery.pageSize,
                totalCount: postsCount,
                items: posts.map((post) => mapper.getClientPost(post))
            };
        }
        return null
    }
    async getPostsBlog(blogId:string, blogsQuery:BlogsQueryT):Promise<EndRouterT<PostSimpleIdT[]>|null> {
        if(blogsQuery.pageNumber && blogsQuery.pageSize) {
            const skip = (blogsQuery.pageNumber - 1) * blogsQuery.pageSize;
            const direction = blogsQuery.sortDirection === "desc"? -1 : 1;
            if(!blogsQuery.sortBy)return null;
            const posts = await postDb
                .find({blogId: blogId})
                .skip(skip)
                .limit(blogsQuery.pageSize)
                .sort({[blogsQuery.sortBy]:direction})

            const postsCount = await postDb.countDocuments();
            return {
                pagesCount: Math.ceil((postsCount - 1) / blogsQuery.pageSize),
                page: blogsQuery.pageNumber,
                pageSize: blogsQuery.pageSize,
                totalCount: postsCount - 1,
                items: posts.map((post) => mapper.getClientPost(post))
            };
        }
        return null
    }
    async getPostId(id:string):Promise<PostMongoIdT|null> {
        return postDb.findOne({_id: new ObjectId(id)})
    }
    async addPost(newPostData:PostT): Promise<PostMongoIdT|null> {
        await postDb.create(newPostData);
        return newPostData as PostMongoIdT;
    }
    async correctPost(correctPostData:{id:string,title:string, shortDescription:string, content:string,blogId:string}):Promise<boolean>{
        const {id,title,shortDescription,content}= correctPostData
        const resultPost = await postDb.updateOne({_id:new ObjectId(id)},{$set: {title,shortDescription,content}})
        return resultPost.matchedCount === 1;
    }
    async delPost(id:string){
        const result = await postDb.deleteOne({_id:new ObjectId(id)})
        return result.deletedCount === 1;}
}

export const postInDbRepository = new PostInDbRepository;
