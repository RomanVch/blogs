
import {BlogSimpleIdT, CorrectPostT, DataForNewPostT, PostMongoIdT, PostSimpleIdT, PostT} from "../repository/types";
import {postInDbRepository} from "../repository/post-in-db-repository";
import {PostsQueryT} from "../routers/postRouter";
import {blogsDbRepository} from "../repository/blogs-db-repository";
import {blogsService} from "./blog-service";
import {EndRouterT} from "../routers/blogsRouter";

export const postService = {
    async getPosts(postQuery:PostsQueryT): Promise<EndRouterT<PostSimpleIdT[]>|null> {
        return postInDbRepository.getPosts(postQuery)
    },
    async getPostId(id:string):Promise<PostMongoIdT|null> {
        return postInDbRepository.getPostId(id)
    },
    async addPost(newPostData:DataForNewPostT): Promise<PostMongoIdT|null> {
        const {title,shortDescription,content,blogId} = newPostData
        const dateNow = new Date()
        const blog = await blogsService.getBlogId(blogId);
        if(!blog) return null
        const newPost:PostT = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: newPostData.blogId + 'Name',
            createdAt:dateNow.toISOString()
        }
        return postInDbRepository.addPost(newPost)
    },
    async correctPost(correctPostData:CorrectPostT):Promise<boolean>{
        return postInDbRepository.correctPost(correctPostData);
    },
    async delPost(id:string){
        return postInDbRepository.delPost(id)
    }
}

