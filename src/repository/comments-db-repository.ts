import {CommentSimpleIdT, NewCommentT} from "./types";
import {client} from "./dataBase";
import {mapper} from "../utils/mapper";
import {EndRouterT} from "../routers/blogsRouter";
import {PostsQueryT} from "../routers/postRouter";
import {ObjectId} from "mongodb";

const commentsDb = client.db("blogs").collection<CommentSimpleIdT>("comments")

export const commentsDbRepository = {
    async getPostsComments(postId: string,commentQuery:PostsQueryT): Promise<EndRouterT<CommentSimpleIdT[]>|null> {
        if(commentQuery.pageNumber && commentQuery.pageSize && commentQuery.sortBy && commentQuery.sortDirection){
            const skip = (commentQuery.pageNumber -1) * commentQuery.pageSize;
            const direction = commentQuery.sortDirection === "desc"? -1 : 1;
            if(!commentQuery.sortDirection) return null
            const comments = await commentsDb
                .find({postId})
                .skip(skip)
                .limit(commentQuery.pageSize)
                .sort({[commentQuery.sortBy]:direction})
                .toArray()
            const commentsCount = await commentsDb.find({postId}).count();
            return {
                pagesCount: Math.ceil(commentsCount / commentQuery.pageSize),
                page: commentQuery.pageNumber,
                pageSize: commentQuery.pageSize,
                totalCount: commentsCount,
                items: comments.map((comment) => mapper.getSimpleAfterDbComment(comment)
                )};
        }
        return null
    },
    
    async getCommentById(commentId:string) {
        const comment = await commentsDb.find({_id:new ObjectId(commentId)}).toArray()
        if(comment[0]){
            return mapper.getSimpleAfterDbComment(comment[0])
        } else{
            return null
        }

    },
    async addComments(newComment: NewCommentT): Promise<CommentSimpleIdT> {
       const result = await client.db('blogs').collection("comments").insertOne(newComment);
      return mapper.getSimpleComment(newComment,result.insertedId)
    },
    async correctComment(commentId:string,content:string):Promise<boolean>{
        const resultPost = await commentsDb.updateOne({_id:new ObjectId(commentId)},{$set: {content}})
        return resultPost.matchedCount === 1;
    },
    async deleteComment(commentId:string):Promise<boolean>{
    const result = await commentsDb.deleteOne({_id:new ObjectId(commentId)})
        return result.deletedCount === 1;
    },
}
