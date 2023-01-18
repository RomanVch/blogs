import {
    BlogMongoIdT,
    BlogSimpleIdT,
    PostMongoIdT,
    PostSimpleIdT,
    UserMongoIdT,
    UserSimpleIdT
} from "../repository/types";


export const mapper = {
    getClientBlog:(blog:BlogMongoIdT):BlogSimpleIdT=>{
        return {id:blog._id+"",
            name:blog.name,
            description:blog.description,
            websiteUrl:blog.websiteUrl,
            createdAt:blog.createdAt
        }
    },
    getClientPost:(post:PostMongoIdT):PostSimpleIdT => {
        return {
            id:post._id+"",
            title:post.title,
            blogId:post.blogId,
            blogName:post.blogName,
            content:post.content,
            shortDescription:post.shortDescription,
            createdAt:post.createdAt
        }
    },
    getUserPost:(user:UserMongoIdT):UserSimpleIdT => {
        return {
            id: user._id+"",
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        }
    }
}