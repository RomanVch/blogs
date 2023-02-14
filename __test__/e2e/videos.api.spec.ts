import {client} from "../../src/repository/dataBase";

const request = require('supertest');
import {app} from "../../src/initApp";
import {jwtService} from "../../src/application/jwt-service";

const user = {
    login: "valera1",
    password: "123456",
    email:"romavyacheslavovich@gmail.com"
};

const cleanerDb = ()=>{
    it('возвращает 204 если зачистили базу', async () => {
        await request(app).delete('/testing/all-data')

        const response = await request(app)
            .post('/auth/registration')
            .set(commonHeaders(userAgent[0]))
            .send(user)
        expect(response.status).toBe(204);
    });
}
const checkUser = ()=>{
    it("should return all products", async () => {
        const res = await request(app).get("/users");
        expect(res.statusCode).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
    });
}

const login = ()=>{
    it("Логинемся 4 раза", async () => {
        const req = await request(app).post("/auth/login").set(commonHeaders(userAgent[0])).send({
            loginOrEmail: user.login,
            password: user.password
        })
        expect(req.statusCode).toBe(200)
    });
    }
describe("checkUser", () => {
    beforeAll(async () => {
        cleanerDb()
    })
    checkUser()
    afterAll(async () => {
        await client.close();
    })
});

const userAgent = ['Windows','Mac','Mac OS X','Linux','Google']
const commonHeaders = (userAgent:string,cookie?:string)=>({
    "Content-Type":"application/json",
    "User-Agent":userAgent,
    "Cookie": cookie?cookie:""
})
describe('POST /registration', () => {
    cleanerDb()
    checkUser()
    const device:{[key:string]:string} = {}
    it("Логинемся 4 раза", async () => {
           const req = await request(app).post("/auth/login").set(commonHeaders(userAgent[0])).send({loginOrEmail: user.login, password: user.password})
           expect(req.statusCode).toBe(200)
        device[userAgent[0]] = req.header["set-cookie"][0].replace("refreshToken=", "").replace("; Path=/; HttpOnly","")
        console.error(req.header["set-cookie"][0].replace("refreshToken=", ""))
        console.error(commonHeaders(userAgent[1]))

               const req1 = await request(app).post("/auth/login").set(commonHeaders(userAgent[1])).send({loginOrEmail: user.login, password: user.password})
            expect(req1.statusCode).toBe(200)
        device[userAgent[1]] = req1.header["set-cookie"][0].replace("refreshToken=", "").replace("; Path=/; HttpOnly","")
        console.error(req1.header["set-cookie"][0].replace("refreshToken=", ""))

        const req2 = await request(app).post("/auth/login").set(commonHeaders(userAgent[2])).send({loginOrEmail: user.login, password: user.password})
            expect(req2.statusCode).toBe(200)
        device[userAgent[2]] = req2.header["set-cookie"][0].replace("refreshToken=", "").replace("; Path=/; HttpOnly","")

            const req3 = await request(app).post("/auth/login").set(commonHeaders(userAgent[3])).send({loginOrEmail: user.login, password: user.password})
            expect(req3.statusCode).toBe(200)
        device[userAgent[3]] = req3.header["set-cookie"][0].replace("refreshToken=", "").replace("; Path=/; HttpOnly","")
        console.error(device)
        });

    it('удаляем все девайс сессии',async ()=>{
        const getUserHeaders = commonHeaders(userAgent[3],`refreshToken=${device[userAgent[3]]}; Path=/; HttpOnly`)
        const ids = await jwtService.getUserIdByToken(device[userAgent[0]],'refresh')
        if(!ids){
            expect(ids).toBe(true)
        }
        const deleteDeviceSession = ids && await request(app).delete(`/security/devices/${ids.deviceId}`).set(getUserHeaders)
        expect(deleteDeviceSession.status).toBe(204);
        ////////////////////////////////
        const ids1 = await jwtService.getUserIdByToken(device[userAgent[1]],'refresh')
        if(!ids1){
            expect(ids1).toBe(true)
        }
        const deleteDeviceSession1 = ids1 && await request(app).delete(`/security/devices/${ids1.deviceId}`).set(getUserHeaders)
        expect(deleteDeviceSession1.status).toBe(204);
        ////////////////////////////////
        const ids2 = await jwtService.getUserIdByToken(device[userAgent[2]],'refresh')
        if(!ids2){
            expect(ids2).toBe(true)
        }
        const deleteDeviceSession2 = ids2 && await request(app).delete(`/security/devices/${ids2.deviceId}`).set(getUserHeaders)
        expect(deleteDeviceSession2.status).toBe(204);
    });
    it('Проверка userDevice', async () => {
        const user = {
            login: 'a', // слишком короткий
            password: 'b', // слишком короткий
            email: 'invalid-email' // недопустимый формат
        };
        const getUserHeaders = commonHeaders(userAgent[3],`refreshToken=${device[userAgent[3]]}; Path=/; HttpOnly`)
        const response = await request(app)
            .get('/security/devices')
            .set(getUserHeaders);
        expect(response.body.length).toBeGreaterThan(0);
    });
    it('возвращает 400 при вводе недопустимых данных', async () => {
        const user = {
            login: 'a', // слишком короткий
            password: 'b', // слишком короткий
            email: 'invalid-email' // недопустимый формат
        };

        const response = await request(app)
            .post('/auth/registration')
            .send(user);

        expect(response.status).toBe(400);
    });

    afterAll(async () => {
        await client.close();
    })
});

describe('AUTH /logout', () => {
    cleanerDb()
    checkUser()
    let refreshToken="";
    it("Логинемся", async () => {
        const req = await request(app).post("/auth/login").set(commonHeaders(userAgent[0])).send({
            loginOrEmail: user.login,
            password: user.password
        })
        expect(req.statusCode).toBe(200)
        refreshToken = req.header["set-cookie"][0]
    })
    it("Выходим", async () => {
        console.log(refreshToken,commonHeaders(userAgent[0],refreshToken))
        const req = await request(app).post("/auth/logout").set(commonHeaders(userAgent[0],refreshToken)).send()
        expect(req.statusCode).toBe(200)
    })
    it("Проверяем что девайс сессии пустые", async () => {
        const req = await request(app).get("/security/devices").set(commonHeaders(userAgent[0],refreshToken)).send()
       expect(req.statusCode).toBe(200)
       expect(req.body.length).toBe(0)
    })

});