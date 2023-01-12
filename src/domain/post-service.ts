
import {CorrectPostT, DataForNewPostT, PostMongoIdT, PostT} from "../repository/types";
import {postInDbRepository} from "../repository/post-in-db-repository";
import {PostsQueryT} from "../routers/postRouter";

export const postService = {
    async getPosts(postQuery:PostsQueryT): Promise<PostMongoIdT[]> {
       return postInDbRepository.getPosts(postQuery)

    },
    async getPostId(id:string):Promise<PostMongoIdT|null> {
        return postInDbRepository.getPostId(id)
    },
    async addPost(newPostData:DataForNewPostT): Promise<PostMongoIdT|null> {
        const {title,shortDescription,content,blogId} = newPostData
        const dateNow = new Date()
        const newPost:PostT = {
            title,
            shortDescription,
            content,
            blogId,
            blogName: newPostData.blogId + 'Name',
            createdAt:dateNow.toISOString()
        }
        console.log(newPost)
        return postInDbRepository.addPost(newPost)
    },
    async correctPost(correctPostData:CorrectPostT):Promise<boolean>{
        return postInDbRepository.correctPost(correctPostData);
    },
    async delPost(id:string){
        return postInDbRepository.delPost(id)
    }
}

