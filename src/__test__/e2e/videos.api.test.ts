import {app} from "../../index";
import request from 'supertest';

describe("GET /posts", () => {
    it("should return all products", async () => {
        const res = await request(app).get("/posts");
        expect(res.statusCode).toBe(200);
    });
});