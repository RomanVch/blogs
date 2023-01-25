import {Router} from "express";

import {commentsService} from "../domain/comments-service";
import {validBodyString, validParamCommentId} from "../utils/validators";
import {errorsValidatorMiddleware} from "../middlewares/errors-middlewares";
import {authJwt} from "../middlewares/authJwt";

export const commentsRouter = Router({});

commentsRouter.get('/:id',
    async (req, res) => {
        const id = req.params.id;
        const comment = await commentsService.getCommentById(id);
        if (comment) {
            res.send(comment)
        } else {
            res.sendStatus(404)
        }
    })

commentsRouter.put('/:id',
    authJwt,
    validBodyString('content',20,300),
    validParamCommentId(),
    errorsValidatorMiddleware,
    async (req, res) => {
        const id = req.params.id;
        const comment = await commentsService.getCommentById(id)
        const user = req.user
        const {content} = req.body
        if(user && comment && comment.commentatorInfo.userId === user.id){
            const commentCheck = await commentsService.correctComment(id,content)
            commentCheck ? res.sendStatus(204): res.sendStatus(404)
        }else {
            return res.sendStatus(403)  
        }

    })
commentsRouter.delete('/:id',
    authJwt,
    validParamCommentId(),
    errorsValidatorMiddleware,
    async (req, res) => {
        const id = req.params.id
        const comment = await commentsService.getCommentById(id)
        const user = req.user
        if(user && comment && comment.commentatorInfo.userId === user.id){
            const checkComment = await commentsService.deleteCommentById(id)
            if (checkComment) {
                res.sendStatus(204)
            } else {
                res.sendStatus(404)
            }
        } else {
            res.sendStatus(403)
        }

    })

