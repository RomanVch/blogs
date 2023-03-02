import {Blog, BlogMongoIdT, BlogSimpleIdT, CorrectBlogT, PostSimpleIdT} from "../repository/types";
import {BlogsDbRepository} from "../repository/blogs-db-repository";
import {BlogsQueryT, EndRouterT} from "../routers/blogsRouter";
import {PostInDbRepository} from "../repository/post-in-db-repository";

export class BlogService {
    blogsDbRepository: BlogsDbRepository;
    postInDbRepository: PostInDbRepository;
    constructor() {
        this.blogsDbRepository = new BlogsDbRepository;
        this.postInDbRepository = new PostInDbRepository;
    }

    async getBlogs(blogsQuery:BlogsQueryT):Promise<EndRouterT<BlogSimpleIdT[]>|null> {
        return this.blogsDbRepository.getBlogs(blogsQuery)
    }
    async getBlogId(id:string):Promise<BlogMongoIdT|null> {
        return this.blogsDbRepository.getBlogId(id)
    }
    async getBlogPosts(blogId:string,blogsQuery:BlogsQueryT):Promise<EndRouterT<PostSimpleIdT[]>|null> {
        return this.postInDbRepository.getPostsBlog(blogId,blogsQuery)
    }
    async addBlog(newBlogData:{name:string, description:string, websiteUrl:string}): Promise<BlogSimpleIdT>{
        const dateNow = new Date()
        const newBlog = new Blog(newBlogData.name,newBlogData.description,newBlogData.websiteUrl,dateNow.toISOString())
        return this.blogsDbRepository.addBlog(newBlog)
    }
    async correctBlog(correctBlog:CorrectBlogT):Promise<boolean> {
        return this.blogsDbRepository.correctBlog(correctBlog)
    }
    async delBlog(id:string){
        return this.blogsDbRepository.delBlog(id)
    }
}

export const blogsService = new BlogService

