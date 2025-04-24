import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { startDatabase, userCollection } from "./database";
import session from "./sessions";
import { flashMiddleware } from "./middlewares/flashMiddleware";
import { secureMiddleware } from "./middlewares/authMiddleware";
import userRouter from "./routers/userRouter";
import expenseRouter from "./routers/expenseRouter";
import inlogRouter from "./routers/inlogRouter";


dotenv.config()

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);


app.use(session);
app.use(flashMiddleware);
app.use("/", inlogRouter(userCollection));
app.use("/", userRouter(userCollection));
app.use("/", expenseRouter(userCollection));


// Startpagina
app.get('/', (req, res) => {
    const user = req.session.user || null; // Haal de gebruiker uit de sessie
    res.render("index", { user });
});


//routes die beveiligd moeten worden en alle gebruikers bekijken
app.get("/users", secureMiddleware, async (req, res) => {
    const users = await userCollection.find().toArray();
    res.render("users", { users });
});


app.listen(app.get("port"), async () => {
    try {
        await startDatabase();
        console.log("Server started on http://localhost:" + app.get("port"));
    } catch (error) {
        console.log(error);
    }

});
