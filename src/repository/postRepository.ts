import {dataBase} from "./dataBase";

export const postRepository = {
    addPost(newPostData:{title:string, shortDescription:string, content:string,blogId:string}){
       dataBase.postsIdCounter = ++dataBase.postsIdCounter
        const newPost = {
            id:  dataBase.postsIdCounter.toString(),
            title: newPostData.title,
            shortDescription: newPostData.shortDescription,
            content: newPostData.content,
            blogId: newPostData.blogId,
            blogName: newPostData.blogId + 'Name'
        }
        dataBase.posts.push(newPost);
        return newPost
    },
    correctPost(correctPostData:{id:string,title:string, shortDescription:string, content:string,blogId:string}){
        const post = dataBase.posts.find((item)=>item.id === correctPostData.id);
        if(post){
                post.title = correctPostData.title;
                post.shortDescription = correctPostData.shortDescription;
                post.content = correctPostData.content;
                post.blogId = correctPostData.blogId;
                dataBase.posts = dataBase.posts.filter((item)=>item.id !== correctPostData.id);
                dataBase.posts.push(post);
                return true
        } else {
                return false
        }
    },
    delPost(id:string){
        const checkPost = dataBase.posts.find((item)=>item.id === id)
        if(checkPost){
            dataBase.posts = dataBase.posts.filter((item)=> item.id !== id)
            return  true;
    }else {
            return false;
        }}
};