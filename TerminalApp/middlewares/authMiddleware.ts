import { NextFunction, Request, Response } from "express";

export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.locals.user = req.session.user; // voeg de gebruiker toe aan res.locals
        next();
    } else {
        res.redirect("/login");
    }
}