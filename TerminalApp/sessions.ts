import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
//import { User } from "./interfaces";

const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: process.env.MONGODB_URI ?? "mongodb://localhost:27017",
    databaseName: "terminalApp-db",
    collection: "sessions",
})

mongoStore.on("error", (error) => {
    console.error(error);
});

declare module 'express-session' {
    export interface SessionData {
        user?: { id: string; name: string; email: string }; // Alleen de vereiste velden
        message?: { type: "error" | "success"; message: string } | null;
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "secret",
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});