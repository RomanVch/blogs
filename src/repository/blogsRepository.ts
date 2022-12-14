import {dataBase} from "./dataBase";

export const blogsRepository = {
    addBlog(newBlogData:{name:string, description:string, websiteUrl:string}){
        dataBase.blogsIdCounter = ++dataBase.blogsIdCounter
        const newBlog = {
            id: dataBase.blogsIdCounter.toString(),
            name: newBlogData.name,
            description: newBlogData.description,
            websiteUrl: newBlogData.websiteUrl,
        }
        dataBase.blogs.push(newBlog);
        return newBlog
    },
    correctBlog(correctBlogData:{ id:string,name:string, description:string, websiteUrl:string }){
        const blog = dataBase.blogs.find((item)=>item.id === correctBlogData.id);
        if(blog){
                blog.name = correctBlogData.name;
                blog.description = correctBlogData.description;
                blog.websiteUrl = correctBlogData.websiteUrl;
                dataBase.blogs = dataBase.blogs.filter((blog)=>blog.id !== correctBlogData.id);
                dataBase.blogs.push(blog);
                return true
        } else {
                return false
        }
    },
    delBlog(id:string){
        const checkBlog = dataBase.blogs.find((blog)=>blog.id === id)
        if(checkBlog){
            dataBase.blogs = dataBase.blogs.filter((item)=> item.id !== id)
            return  true;
        } else {
            return false;
        }}
};