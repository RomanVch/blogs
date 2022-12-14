"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videosRouter = void 0;
const express_1 = require("express");
const index_1 = require("../index");
exports.videosRouter = (0, express_1.Router)({});
exports.videosRouter.get('/', (req, res) => {
    if (index_1.dataBase.videos.length) {
        res.status(201).send(index_1.dataBase);
    }
});
exports.videosRouter.post('/', (req, res) => {
    const video = {
        id: index_1.dataBase.videos.length + 1,
        title: '',
        author: '',
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date().toISOString(),
        availableResolutions: []
    };
    if (typeof req.body.title === "string" && req.body.title.length > 40) {
        video.title = req.body.title;
    }
    else {
        res.status(400).send({
            errorsMessages: [
                {
                    message: "If the inputModel has incorrect values",
                    field: "title"
                }
            ]
        });
        return;
    }
    if (typeof req.body.author === "string" && req.body.author.length > 40) {
        video.author = req.body.author;
    }
    else {
        res.status(400).send({
            errorsMessages: [
                {
                    message: "If the inputModel has incorrect values",
                    field: "author"
                }
            ]
        });
        return;
    }
    if (Array.isArray(req.body.availableResolutions) && req.body.availableResolutions.length > 0) {
        video.availableResolutions = req.body.availableResolutions;
    }
    else {
        res.status(400).send({
            errorsMessages: [
                {
                    message: "If the inputModel has incorrect values",
                    field: "availableResolutions"
                }
            ]
        });
        return;
    }
    index_1.dataBase.videos.push(video);
    res.status(201).send(video);
});
exports.videosRouter.get('/:id', (req, res) => {
    const video = index_1.dataBase.videos.find((item) => item.id === +req.params.id);
    if (video) {
        res.send(video);
    }
    else {
        res.send(404);
    }
});
exports.videosRouter.put('/:id', (req, res) => {
    const id = +req.params.id;
    const video = index_1.dataBase.videos.find((item) => item.id === id);
    if (video) {
        if (typeof req.body.title === "string" && req.body.title.length < 40) {
            video.title = req.body.title;
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "If the inputModel has incorrect values",
                        field: "title"
                    }
                ]
            });
            return;
        }
        if (typeof req.body.author === "string" && req.body.author.length < 40) {
            video.author = req.body.author;
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "If the inputModel has incorrect values",
                        field: "author"
                    }
                ]
            });
            return;
        }
        const checkString = req.body.availableResolutions.filter((item) => typeof item === "string");
        if (Array.isArray(req.body.availableResolutions) && req.body.availableResolutions.length > 0 && checkString.length === req.body.availableResolutions.length) {
            video.availableResolutions = req.body.availableResolutions;
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "If the inputModel has incorrect values",
                        field: "availableResolutions"
                    }
                ]
            });
            return;
        }
        if (typeof req.body.canBeDownloaded === "boolean") {
            video.canBeDownloaded = req.body.canBeDownloaded;
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "If the inputModel has incorrect values",
                        field: "canBeDownloaded"
                    }
                ]
            });
            return;
        }
        if (typeof req.body.minAgeRestriction === "number" && req.body.minAgeRestriction < 19 && req.body.minAgeRestriction > 0) {
            video.minAgeRestriction = req.body.minAgeRestriction;
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "If the inputModel has incorrect values",
                        field: "minAgeRestriction"
                    }
                ]
            });
            return;
        }
        if (typeof Date.parse(req.body.publicationDate) === "number") {
            video.publicationDate = req.body.publicationDate;
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "If the inputModel has incorrect values",
                        field: "publicationDate"
                    }
                ]
            });
            return;
        }
        index_1.dataBase.videos = index_1.dataBase.videos.filter((item) => item.id !== id);
        index_1.dataBase.videos.push(video);
    }
    else {
        res.status(404);
    }
});
exports.videosRouter.delete('/:id', (req, res) => {
    const id = +req.params.id;
    for (let i = 0; i > index_1.dataBase.videos.length; i = i + 1) {
        if (+id === index_1.dataBase.videos[i].id) {
            index_1.dataBase.videos.splice(i, 1);
            res.send(204);
            return;
        }
    }
    res.send(404);
});
