import {BlogMongoIdT, BlogSimpleIdT, PostMongoIdT, PostSimpleIdT} from "../repository/types";

export const mapper = {
    getClientBlog:(blog:BlogMongoIdT):BlogSimpleIdT=>{
        return {id:blog._id+"", name:blog.name, description:blog.description, websiteUrl:blog.websiteUrl, createdAt:blog.createdAt}
    },
    getClientPost:(post:PostMongoIdT):PostSimpleIdT=>{
        return {
            id:post._id+"",
            title:post.title,
            shortDescription:post.shortDescription,
            content:post.content,
            createdAt:post.createdAt,
            blogId:post.blogId,
            blogName:post.blogName
        }
    }
}