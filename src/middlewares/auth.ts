import {Request, Response, NextFunction} from "express";

export const auth = (req:Request, res:Response, next:NextFunction) => {

    const auth = [{login: 'admin', password: 'qwerty'},{login: '1234', password: '1234'}];
    if(req.headers.authorization){
        const typeAuth = (req.headers.authorization).split(' ')[0];
        if(typeAuth === 'Basic'){
        const b64auth = (req.headers.authorization).split(' ')[1];
        const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
        let index = auth.findIndex(el => el.login === login);
        if (auth[index] && login && password && login === auth[index].login && password === auth[index].password) {
            return next()
        }
            res.status(401).send('Authentication required.');
        } else {
            res.status(401).send('Authentication required.')
        }
        } else {
        res.status(401).send('Authentication required.');
    }

}