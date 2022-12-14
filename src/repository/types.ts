export type PostT = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string
}

export type BlogT = {
     id :  string ,
     name :  string ,
     description :  string ,
     websiteUrl :  string 
}
export type DataBaseT = {
    blogs:BlogT[],
    blogsIdCounter:number,
    posts:PostT[],
    postsIdCounter:number

}