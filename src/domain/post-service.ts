import {CorrectPostT, DataForNewPostT, Post, PostMongoIdT, PostSimpleIdT} from "../repository/types";
import {PostsQueryT} from "../routers/postRouter";
import {blogsService} from "./blog-service";
import {EndRouterT} from "../routers/blogsRouter";
import {PostInDbRepository} from "../repository/post-in-db-repository";

export class PostService {
    postInDbRepository: PostInDbRepository;
    constructor() {
        this.postInDbRepository = new PostInDbRepository;
    }
    async getPosts(postQuery:PostsQueryT): Promise<EndRouterT<PostSimpleIdT[]>|null> {
        return this.postInDbRepository.getPosts(postQuery)
    }
    async getPostId(id:string):Promise<PostMongoIdT|null> {
        return this.postInDbRepository.getPostId(id)
    }
    async addPost(newPostData:DataForNewPostT): Promise<PostMongoIdT|null> {
        const {title,shortDescription,content,blogId} = newPostData
        const dateNow = new Date()
        const blog = await blogsService.getBlogId(blogId);
        if(!blog) return null
        const newPost = new Post(title,shortDescription,content,blogId,newPostData.blogId + 'Name',dateNow.toISOString())
        return this.postInDbRepository.addPost(newPost)
    }
    async correctPost(correctPostData:CorrectPostT):Promise<boolean>{
        return this.postInDbRepository.correctPost(correctPostData);
    }
    async delPost(id:string){
        return this.postInDbRepository.delPost(id)
    }
}

export const postService = new PostService;

