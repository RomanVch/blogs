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
    validBodyString('content',1,1000),
    validParamCommentId(),
    errorsValidatorMiddleware,
    async (req, res) => {
        const id = req.params.id;
        const {content} = req.body
        const commentCheck = await commentsService.correctComment(id,content)
        commentCheck ? res.sendStatus(204): res.sendStatus(404)
    })
commentsRouter.delete('/:id',
    authJwt,
    validParamCommentId(),
    errorsValidatorMiddleware,
    async (req, res) => {
        const id = req.params.id
        const checkComment = await commentsService.deleteCommentById(id)
        if (checkComment) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })

