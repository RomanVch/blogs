import {mapper} from "../utils/mapper";
import {EndRouterT} from "../routers/blogsRouter";
import {PostsQueryT} from "../routers/postRouter";
import {ObjectId} from "mongodb";
import {commentsModel} from "./Schemas";
import {CommentSimpleIdT, NewCommentT} from "./types";

const commentsDb = commentsModel//client.db("blogs").collection<CommentSimpleIdT>("comments")

export class CommentsDbRepository {
    async getPostsComments(postId: string,commentQuery:PostsQueryT,userId:string): Promise<EndRouterT<CommentSimpleIdT[]>|null> {
        if(commentQuery.pageNumber && commentQuery.pageSize && commentQuery.sortBy && commentQuery.sortDirection){
            const skip = (commentQuery.pageNumber -1) * commentQuery.pageSize;
            const direction = commentQuery.sortDirection === "desc"? -1 : 1;
            if(!commentQuery.sortDirection) return null
            const comments = await commentsDb
                .find({postId})
                .skip(skip)
                .limit(commentQuery.pageSize)
                .sort({[commentQuery.sortBy]:direction})
            const commentsCount = await commentsDb.find({postId}).count();
            return {
                pagesCount: Math.ceil(commentsCount / commentQuery.pageSize),
                page: commentQuery.pageNumber,
                pageSize: commentQuery.pageSize,
                totalCount: commentsCount,
                items: comments.map((comment) => mapper.getSimpleAfterDbComment(comment,userId)
                )};
        }
        return null
    }
    async getCommentById(commentId:string, userId:string) {
        console.log(await commentsDb
            .find())
        const comment = await commentsDb.find({_id:new ObjectId(commentId)})
        if(comment[0]){
            return mapper.getSimpleAfterDbComment(comment[0],userId)
        } else{
            return null
        }

    }
    async addComments(newComment: NewCommentT): Promise<CommentSimpleIdT> {
        const result = await commentsDb.create(newComment);
        return mapper.getSimpleComment(newComment,result._id)
    }
    async correctComment(commentId:string,content:string):Promise<boolean>{
        const resultPost = await commentsDb.updateOne({_id:new ObjectId(commentId)},{$set: {content}})
        return resultPost.matchedCount === 1;
    }
    async changelikeComment(commentId:string,like:string,userId:string):Promise<boolean>{
        try{
            if (like === "Like" || like === "Dislike" || like === "None") {
                console.log(1)
               await commentsDb.updateOne(
            { _id: new ObjectId(commentId) },  // Указываем ID документа
            {
                $pull: {
                    "likesInfo.likes": { id: userId },
                    "likesInfo.dislikes": { id: userId }
                }
            }
        )
        if (like === "Like") {
            console.log(2)
           await commentsDb.updateOne(
                { _id: new ObjectId(commentId) },  // Указываем ID документа
                {
                    $push: {
                        "likesInfo.likes": { id: userId, date: new Date().toISOString() },
                    }
                }
            )
            return true
        }
        if (like === "Dislike") {
           await commentsDb.updateOne(
                {_id: new ObjectId(commentId)},  // Указываем ID документа
                {
                    $push: {
                        "likesInfo.dislikes": {id: userId, date: new Date().toISOString()},
                    }
                }
            )
            return true
        }
        return true }
            return false;
        }catch (e) {
            return false
        }

    }
    async deleteComment(commentId:string):Promise<boolean>{
        const result = await commentsDb.deleteOne({_id:new ObjectId(commentId)})
        return result.deletedCount === 1;
    }
}

export const commentsDbRepository = new  CommentsDbRepository
