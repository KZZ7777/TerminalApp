import { NextFunction, Request, Response } from "express";

export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.message) {
        res.locals.message = req.session.message;
        delete req.session.message; // Verwijder de message na één keer tonen
    } else {
        res.locals.message = undefined;
    }
    next();
}
