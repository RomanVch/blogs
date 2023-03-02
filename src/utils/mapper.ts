import {
    BlogMongoIdT,
    BlogSimpleIdT,
    CommentMongoIdT,
    CommentSimpleIdT,
    LikesObjectT,
    NewCommentT,
    PostMongoIdT,
    PostSimpleIdT,
    UserMongoIdT,
    UserSimpleIdT
} from "../repository/types";
import {ObjectId} from "mongodb";

class Mapper {
    getClientBlog(blog:BlogMongoIdT):BlogSimpleIdT {
        return {id:blog._id+"",
            name:blog.name,
            description:blog.description,
            websiteUrl:blog.websiteUrl,
            createdAt:blog.createdAt
        }
    }
    getClientPost(post:PostMongoIdT):PostSimpleIdT  {
        return {
            id:post._id+"",
            title:post.title,
            blogId:post.blogId,
            blogName:post.blogName,
            content:post.content,
            shortDescription:post.shortDescription,
            createdAt:post.createdAt
        }
    }
    getUserPost(user:UserMongoIdT):UserSimpleIdT  {
        return {
            id: user._id+"",
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        }
    }
    myStatus (like:LikesObjectT[],dislikes:LikesObjectT[],idUser:string) {
        const checkLike = like.find((likeMap)=> likeMap.id === idUser)
        if(checkLike){
            return "Like"
        }
        const checkDislike = dislikes.find((dislikeMap)=> dislikeMap.id === idUser)
        if(checkLike){
            return "Dislike"
        }
        return 'None'
    }
    getSimpleComment(comment:NewCommentT,id:ObjectId):CommentSimpleIdT {
        const status = this.myStatus(comment.likesInfo.likes,comment.likesInfo.dislikes,id.toString())
        return {
        id:id.toString(),
        content:comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt:comment.createdAt,
        likesInfo:{likesCount:comment.likesInfo.likes.length ,dislikesCount:comment.likesInfo.dislikes.length, myStatus:status},
    }}
    getSimpleAfterDbComment(comment:CommentMongoIdT,id:string):CommentSimpleIdT {
        const status = this.myStatus(comment.likesInfo.likes,comment.likesInfo.dislikes,id)
        return {
        id:comment._id.toString(),
        content:comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt:comment.createdAt,
            likesInfo:{likesCount:comment.likesInfo.likes.length ,dislikesCount:comment.likesInfo.dislikes.length, myStatus:status},
    }}
}

export const mapper = new Mapper();