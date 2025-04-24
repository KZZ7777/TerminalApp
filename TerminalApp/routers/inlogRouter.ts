import express from "express";
import bcrypt from "bcrypt";
import { Collection } from "mongodb";
import { User } from "../interfaces";

export default function inlogRouter(userCollection: Collection<User>) {
    const router = express.Router();

    // Loginpagina weergeven
    router.get("/login", (req, res) => {

        res.render("login");
    });

    // Loginverwerking
    router.post("/login", async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await userCollection.findOne({ email: username });
            if (!user) {
                req.session.message = { type: "error", message: "Gebruiker niet gevonden!" };
                return res.redirect("/login");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                req.session.message = { type: "error", message: "Onjuist wachtwoord!" };
                return res.redirect("/login");
            }

            req.session.user = { id: user.id, name: user.name, email: user.email };
            req.session.message = { type: "success", message: "Succesvol ingelogd!" };
            res.redirect("/");
        } catch (error) {
            console.error(error);
            req.session.message = { type: "error", message: "Er is iets misgegaan. Probeer opnieuw." };
            res.redirect("/login");
        }
    });

    // Uitloggen
    router.get("/logout", (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Fout bij uitloggen:", err);
                return res.status(500).send("Er is iets misgegaan tijdens het uitloggen.");
            }
            res.redirect("/login");
        });
    });

    return router;
}
