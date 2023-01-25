import {CommentSimpleIdT, UserSimpleIdT} from "../repository/types";
import {mapper} from "../utils/mapper";
import {commentsDbRepository} from "../repository/comments-db-repository";
import {PostsQueryT} from "../routers/postRouter";
import {EndRouterT} from "../routers/blogsRouter";

export const commentsService = {
        async getPostComments(postId:string, commentQuery:PostsQueryT): Promise<EndRouterT<CommentSimpleIdT[]>|null> {
        return commentsDbRepository.getPostsComments(postId,commentQuery)
    },
    async getCommentById(commentId:string):Promise<CommentSimpleIdT|null> {
            return commentsDbRepository.getCommentById(commentId)
},
    async addComment(user:UserSimpleIdT,content:string, postId:string): Promise<CommentSimpleIdT> {
        const newComment = mapper.getNewComment(user, content, postId)
        return await commentsDbRepository.addComments(newComment)
    },
    async correctComment(commentId:string, content:string):Promise<boolean> {
            return await commentsDbRepository.correctComment(commentId,content)
    },
    async deleteCommentById(commentId:string):Promise<boolean> {
        return await commentsDbRepository.deleteComment(commentId)
    }
}