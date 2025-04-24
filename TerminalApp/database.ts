import { MongoClient, Collection } from "mongodb";
import { User } from "./interfaces";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config()
export const client = new MongoClient(process.env.MONGODB_URI ||"mongodb://localhost:27017");

export const database = client.db("terminalApp-db");
export const userCollection: Collection<User> = database.collection("users");

export async function startDatabase() {
    try {
        await client.connect();
        console.log("Geconnecteerd met de database");
        process.on("SIGINT", async () => {
            await stopDatabase();
            process.exit();
        })
    } catch (e) {
        console.error("Fout bij het verbinden", e);
        process.exit(0);
    }

}

export async function stopDatabase() {
    try {
        await client.close();
        console.log("Database verbinding gesloten.");
    } catch (err: any) {
        console.log(err)
    }
};

export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email en wachtwoord zijn vereist.");
    }

    const user = await userCollection.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password!))) {
        return user;
    }
    throw new Error("Ongeldig e-mailadres of wachtwoord.");
}

