import express from "express";
import bcrypt from "bcrypt";
import { Collection } from "mongodb";
import { User, Budget } from "../interfaces";

export default function userRouter(userCollection: Collection<User>) {
    const router = express.Router();

   
    // Gebruikers toevoegen formulier
    router.get("/addUsers", (req, res) => {
        res.render("addUsers");
    });


    // Gebruiker toevoegen
    router.post("/addUsers", async (req, res) => {
        const { id, name, email, password, monthlyLimit } = req.body;

        // Check of de ID bestaat
        const usedId = await userCollection.findOne({ id });
        if (usedId) {
            return res.status(400).send("Deze Id bestaat al!");
        }

        // Check of de e-mail bestaat
        const userExists = await userCollection.findOne({ email });
        if (userExists) {
            req.session.message = { type: "error", message: "Gebruiker met dit e-mailadres bestaat al!" };
            return res.redirect("/addUsers");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Budget data parsen
        const budget: Budget = {
            monthlyLimit: parseFloat(monthlyLimit) || 0,
            notificationThreshold: 0,
            isActive: false,
        };

        // Nieuw user-object maken
        const newUser: User = {
            id,
            name,
            email,
            password: hashedPassword,
            expenses: [],
            budget,
        };

        // Toevoegen aan de gebruikerscollectie
        await userCollection.insertOne(newUser);
        req.session.message = { type: "success", message: "Gebruiker succesvol toegevoegd!" };

        // Redirect naar de gebruikerspagina
        res.redirect("/login");
    });

    return router;
}
