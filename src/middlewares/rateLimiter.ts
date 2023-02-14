import {NextFunction,Request,Response} from "express";

type EndpointAttempts = {
    count: number;
    lastAttempt: number;
}

const attempts: Record<string, EndpointAttempts> = {};

export const limitAttempts = (req: Request, res: Response, next: NextFunction) => {
    const endpoint = req.path;
    const maxAttempts = 5;
    const windowMs = 10 * 1000;
    const now = Date.now();

    if (!attempts[endpoint]) {
        attempts[endpoint] = {
            count: 1,
            lastAttempt: now,
        };
        return next();
    }

    const { count, lastAttempt } = attempts[endpoint];
    const diff = now - lastAttempt;

    if (diff > windowMs) {
        attempts[endpoint] = {
            count: 1,
            lastAttempt: now,
        };
         next();
    }

    if (count >= maxAttempts) {
        const resetTime = new Date(lastAttempt + windowMs);
        // @ts-ignore
        res.set("Retry-After", Math.ceil((resetTime - now) / 1000));
         res.status(429).send();
        return
    }

    attempts[endpoint].count = count + 1;
    next();
}