import {
    BlogMongoIdT,
    BlogSimpleIdT,
    CommentMongoIdT,
    CommentSimpleIdT,
    NewCommentT,
    PostMongoIdT,
    PostSimpleIdT,
    UserMongoIdT,
    UserSimpleIdT
} from "../repository/types";
import {ObjectId} from "mongodb";


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
    },
    getNewComment:(user:UserSimpleIdT,content:string, postId:string):NewCommentT =>({
        postId,
        content,
        commentatorInfo: {
            userId: user.id,
            userLogin: user.login
        },
        createdAt:(new Date()).toISOString(),
    }),

    getSimpleComment:(comment:NewCommentT,id:ObjectId):CommentSimpleIdT=>({
      id:id.toString(),
        content:comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt:comment.createdAt,
    }),
    getSimpleAfterDbComment:(comment:CommentMongoIdT):CommentSimpleIdT=>({
        id:comment._id.toString(),
        content:comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt:comment.createdAt,
    })
}