import {Router,Request,Response} from "express";

import {validBodyLike, validBodyString, validParamCommentId} from "../utils/validators";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authJwt} from "../middlewares/authJwt";
import {CommentService} from "../domain/comments-service";

export const commentsRouter = Router({});

class CommentsController {
    commentsService:CommentService
    constructor() {
    this.commentsService = new CommentService;
    }
    async getComment (req:Request, res:Response) {
    const id = req.params.id;
    const comment = await this.commentsService.getCommentById(id,"noId");
    if (comment) {
        res.send(comment)
    } else {
    res.sendStatus(404)
}
}
    async editComment (req:Request, res:Response):Promise<any> {
    const id = req.params.id;
    const comment = await this.commentsService.getCommentById(id,"noId")
    const user = req.user
    const {content} = req.body
if(user && comment && comment.commentatorInfo.userId === user.id){
    const commentCheck = await this.commentsService.correctComment(id,content)
    commentCheck ? res.sendStatus(204): res.sendStatus(404)
}else {
    return res.sendStatus(403)
}
}
    async changeLikeStatus (req:Request, res:Response):Promise<any> {
        console.log(1)
        const id = req.params.id;
        const comment = await this.commentsService.getCommentById(id,"noId")
        const user = req.user
        const {likeStatus} = req.body
        if(user && comment && comment.commentatorInfo.userId === user.id){
            const commentCheck = await this.commentsService.changeLikeComment(id,likeStatus,user.id)
            commentCheck ? res.sendStatus(204): res.sendStatus(404)
            return
        }else {
            return res.sendStatus(403)
        }
    }

    async deletComment (req:Request, res:Response):Promise<any> {
    const id = req.params.id
    const comment = await this.commentsService.getCommentById(id,"noId")
    const user = req.user
    if(user && comment && comment.commentatorInfo.userId === user.id){
    const checkComment = await this.commentsService.deleteCommentById(id)
    if (checkComment) {
        res.sendStatus(204)
    } else {
    res.sendStatus(404)
}
} else {
    res.sendStatus(403)
}

}

}

const commentsControllerInstance = new CommentsController;

commentsRouter.get('/:id',
    commentsControllerInstance.getComment.bind(commentsControllerInstance),
)

commentsRouter.put('/:id',
    authJwt,
    validBodyString('content',20,300),
    validParamCommentId(),
    errorsValidatorMiddleware,
    commentsControllerInstance.editComment.bind(commentsControllerInstance)
    )
commentsRouter.put('/:id/like-status',
    authJwt,
    validBodyLike(),
    validParamCommentId(),
    errorsValidatorMiddleware,
    commentsControllerInstance.changeLikeStatus.bind(commentsControllerInstance)
)
commentsRouter.delete('/:id',
    authJwt,
    validParamCommentId(),
    errorsValidatorMiddleware,
    commentsControllerInstance.deletComment.bind(commentsControllerInstance)
    )

