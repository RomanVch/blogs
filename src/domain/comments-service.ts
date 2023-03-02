import {Comment, CommentSimpleIdT, LikeCommentForDbT, UserSimpleIdT} from "../repository/types";
import {CommentsDbRepository} from "../repository/comments-db-repository";
import {PostsQueryT} from "../routers/postRouter";
import {EndRouterT} from "../routers/blogsRouter";

export class CommentService {
    commentsInDbRepository: CommentsDbRepository;
    constructor() {
        this.commentsInDbRepository = new CommentsDbRepository;
    }
    async getPostComments(postId:string, commentQuery:PostsQueryT,userId:string): Promise<EndRouterT<CommentSimpleIdT[]>|null> {
        return this.commentsInDbRepository.getPostsComments(postId,commentQuery,userId)
    }
    async getCommentById(commentId:string,userId:string):Promise<CommentSimpleIdT|null> {
        return this.commentsInDbRepository.getCommentById(commentId,userId)
    }
    async addComment(user:UserSimpleIdT,content:string, postId:string): Promise<CommentSimpleIdT> {
        const likesInfo:LikeCommentForDbT = {likes:[],dislikes:[]}
        const newComment = new Comment(postId,content,{userId:user.id,userLogin:user.login},(new Date()).toISOString(),likesInfo)
        return this.commentsInDbRepository.addComments(newComment)
    }
    async correctComment(commentId:string, content:string):Promise<boolean> {
        return this.commentsInDbRepository.correctComment(commentId,content)
    }
    async changeLikeComment(commentId:string, likeStatus:string,userId:string):Promise<boolean> {
        return this.commentsInDbRepository.changelikeComment(commentId,likeStatus,userId)
    }
    async deleteCommentById(commentId:string):Promise<boolean> {
        return this.commentsInDbRepository.deleteComment(commentId)
    }
}

export const commentsService = new CommentService();