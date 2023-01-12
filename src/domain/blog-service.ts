import {client} from "../repository/dataBase";
import {BlogMongoIdT, BlogSimpleIdT, BlogT, CorrectBlogT, PostMongoIdT} from "../repository/types";
import {blogsDbRepository} from "../repository/blogs-db-repository";
import {blogsQueryT} from "../routers/blogsRouter";
import {postInDbRepository} from "../repository/post-in-db-repository";

export const blogsService = {
    async getBlogs(blogsQuery:blogsQueryT):Promise<BlogMongoIdT[]> {
        return blogsDbRepository.getBlogs(blogsQuery)
    },
    async getBlogId(id:string):Promise<BlogMongoIdT|null> {
        return blogsDbRepository.getBlogId(id)
    },
    async getBlogPosts(blogId:string,blogsQuery:blogsQueryT):Promise<PostMongoIdT[]|null> {
        return postInDbRepository.getPostsBlog(blogId,blogsQuery)
    },
    async addBlog(newBlogData:{name:string, description:string, websiteUrl:string}): Promise<BlogSimpleIdT>{
        const dateNow = new Date()
        const newBlog:BlogT = {
            name: newBlogData.name,
            description: newBlogData.description,
            websiteUrl: newBlogData.websiteUrl,
            createdAt:dateNow.toISOString()
        }
        return blogsDbRepository.addBlog(newBlog)
    },
    async correctBlog(correctBlog:CorrectBlogT):Promise<boolean> {
        return blogsDbRepository.correctBlog(correctBlog)
    },
    async delBlog(id:string){
        return blogsDbRepository.delBlog(id)
    }
}

