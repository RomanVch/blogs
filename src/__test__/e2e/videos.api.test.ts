import request from 'supertest'
import {app} from "../../index";

it('/videos',async ()=>{
   await it('getAll',()=>{
       request(app).get('/videos').expect(200,[])
    })
})