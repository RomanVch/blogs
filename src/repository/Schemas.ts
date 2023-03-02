import mongoose from 'mongoose';
import {BlogMongoIdT, CommentMongoIdT, InfoServerT, PostMongoIdT, UserForBaseIdT} from "./types";

const { Schema } = mongoose;

const blogSchema = new Schema<BlogMongoIdT>({
    name:  {type:String,required:true},
    description:  {type:String,required:true},
    websiteUrl:  {type:String,required:true},
    createdAt: {type:String,required:true},
});

export const blogsModel = mongoose.model('blogs', blogSchema);

const userSchema = new Schema<UserForBaseIdT>({
    login: {type:String,required:true},
    email: {type:String,required:true},
    createdAt: {type:String,required:true},
    passwordHash:{type:String,required:true},
    passwordSalt:{type:String,required:true},
    passwordRecoveryCode:{type:String},
    emailConfirmation:{type:{
        isConfirmed:Boolean,
        expirationDate:Date,
        confirmationCode:String,
    },required:true},
    devicesSessions:{type:[{
        ip: String,
        deviceId: String,
        title: String,
        lastActiveDate: String,
    }],required:true}
});

export const usersModel = mongoose.model('users', userSchema);

const postSchema = new Schema<PostMongoIdT>({
    title: {type:String,required:true},
    shortDescription: {type:String,required:true},
    content: {type:String,required:true},
    blogId: {type:String,required:true},
    blogName: {type:String,required:true},
    createdAt:{type:String,required:true},
});

export const postsModel = mongoose.model('posts', postSchema);

const infoBackSchema = new Schema<InfoServerT>({
    blackList: {type:[String],required:true},
});

export const infoBackModel = mongoose.model('infoBack', infoBackSchema);


const commentsSchema = new Schema<CommentMongoIdT>({
    content: {type:String,required:true},
    commentatorInfo: {type:{
        userId: String,
        userLogin: String
    },required:true},
    createdAt: {type:String,required:true},
    likesInfo:{likes:[{id:String, date:String}],dislikes:[{id:String, date:String}] }
});

export const commentsModel = mongoose.model('comments', commentsSchema);