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
    "createdAt": string,
}

export type BlogSimpleIdT = BlogT & { id:string };
export type BlogMongoIdT = WithId<BlogT>;

export type PostSimpleIdT = PostT & { id:string };
export type PostMongoIdT = WithId<PostT>;

export type CommentSimpleIdT = CommentT & { id:string, likesInfo:LikeCommentT };
export type CommentMongoIdT = WithId<CommentT & {likesInfo:LikeCommentForDbT} >;
export type NewCommentT = CommentT & { postId:string,likesInfo:LikeCommentForDbT };


export type UserDevicesSessionsT =   {
    ip: string,
    deviceId: string,
    title: string
}

export type UserDevicesSessionsBaseT =   UserDevicesSessionsT & {
    lastActiveDate: string,
}

type EmailConfirmationT = {
    isConfirmed:boolean,
    expirationDate:Date,
    confirmationCode:string,
}
type CommentatorInfoT = {
    userId: string,
    userLogin: string
}
export


type StatusLikeT = "None"| "Like" | "Dislike";

type LikeCommentT = {
        likesCount: number,
        dislikesCount: number,
        myStatus: StatusLikeT
};

export type LikesObjectT = {id:string, date:string}

export type LikeCommentForDbT = { likes: LikesObjectT[],dislikes: LikesObjectT[] }

export type UserForBaseIdT = UserT & { passwordHash:string, passwordSalt:string, passwordRecoveryCode:string, emailConfirmation:EmailConfirmationT,
    devicesSessions:UserDevicesSessionsBaseT[]
};
export type UserSimpleIdT = UserT & { id:string };
export type UserMongoIdT = WithId<UserForBaseIdT>;

export type DataBaseT =  PostSimpleIdT[] & BlogSimpleIdT[]

export type CorrectBlogT = { id:string,name:string, description:string, websiteUrl:string }
export type DataForNewPostT = {title:string, shortDescription:string, content:string,blogId:string}
export type CorrectPostT = {id:string,title:string, shortDescription:string, content:string,blogId:string}

export type AccessTokenT = {
    accessToken:string
}
export type RefreshTokenT = {
    refreshToken:string
}

export type InfoServerT = {blackList:string[]}



///// classes

export class User {
    constructor(
                    public login: string,
                    public email: string,
                    public createdAt: string,
                    public passwordHash:string,
                    public passwordSalt:string,
                    public passwordRecoveryCode:string,
                    public emailConfirmation:EmailConfirmationT,
                    public devicesSessions:UserDevicesSessionsBaseT[]
    ){}
}

export class Blog {
    constructor(
       public name: string,
       public description: string,
       public websiteUrl: string,
       public createdAt:string) {
    }
}


export class Comment {
    constructor(
        public postId: string,
        public content: string,
        public commentatorInfo: CommentatorInfoT,
        public createdAt:string,
        public likesInfo: LikeCommentForDbT
    ) {
    }
}

export class Post {
    constructor(
       public title: string,
       public shortDescription: string,
       public content: string,
       public blogId: string,
       public blogName: string,
       public createdAt:string,
    ) {
    }
}


