"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataBase = exports.app = void 0;
const express_1 = require("express");
const body_parser_1 = require("body-parser");
const Videos_1 = require("./reducers/Videos");
exports.app = (0, express_1.default)();
const port = 3000;
exports.dataBase = { videos: [
    /*        {
                id: 0,
                title : "start",
                author: "stater",
                canBeDownloaded: false,
                minAgeRestriction: null,
                createdAt: "2022-12-07T17:19:31.774Z",
                publicationDate: "2022-12-07T17:19:31.774Z",
                availableResolutions: ["P144"]
            }*/
    ]
};
const parserMiddleware = (0, body_parser_1.default)();
exports.app.use(parserMiddleware).use("/videos", Videos_1.videosRouter);
exports.app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
