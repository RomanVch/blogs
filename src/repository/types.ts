import {WithId} from "mongodb";

export type PostT = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt:string,
}

export type BlogT = {
     name :  string ,
     description :  string ,
     websiteUrl :  string ,
     createdAt:string,
}

export type UserT = {
    login: string,
    email: string,
    createdAt: string
}

export type CommentT =     {
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    "createdAt": string
}

export type BlogSimpleIdT = BlogT & { id:string };
export type BlogMongoIdT = WithId<BlogT>;

export type PostSimpleIdT = PostT & { id:string };
export type PostMongoIdT = WithId<PostT>;

export type CommentSimpleIdT = CommentT & { id:string };
export type CommentMongoIdT = WithId<CommentT>;
export type NewCommentT = CommentT & { postId:string };

export type UserForBaseIdT = UserT & { passwordHash:string, passwordSalt:string };
export type UserSimpleIdT = UserT & { id:string };
export type UserMongoIdT = WithId<UserForBaseIdT>;

export type DataBaseT =  PostSimpleIdT[] & BlogSimpleIdT[]

export type CorrectBlogT = { id:string,name:string, description:string, websiteUrl:string }
export type DataForNewPostT = {title:string, shortDescription:string, content:string,blogId:string}
export type CorrectPostT = {id:string,title:string, shortDescription:string, content:string,blogId:string}

export type AccessTokenT = {
    accessToken:string
}