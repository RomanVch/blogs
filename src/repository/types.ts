export type PostT = {
    id?: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt:string,
}

export type BlogT = {
     id? :  string ,
     name :  string ,
     description :  string ,
     websiteUrl :  string ,
     createdAt:string,
}


export type DataBaseT =  PostT[] & BlogT[]