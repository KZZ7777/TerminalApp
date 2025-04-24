import express from "express";
import { Collection } from "mongodb";
import { User, Expense, CardDetails } from "../interfaces";
import { v4 as uuidv4 } from "uuid";


export default function expenseRouter(userCollection: Collection<User>) {
    const router = express.Router();

    // Formulier voor inkomsten toevoegen
    router.get("/addIncomes", async (req, res) => {
        const userId = req.query.id;

        const user = await userCollection.findOne({ id: userId });
        if (!user) {
            return res.status(404).send("Gebruiker niet gevonden");
        }
        res.render("addIncomes", { user });
    });

    // Inkomsten toevoegen
    router.post("/users/:id/incomes/addIncomes", async (req, res) => {
        const { id } = req.params;
        const { description, amount, date, currency, category, tags, method, cardNumber, expiryDate } = req.body;

        const user = await userCollection.findOne({ id });
        if (!user) {
            return res.status(404).send("Gebruiker niet gevonden");
        }

        const newIncome: Expense = {
            id: uuidv4(),
            description,
            amount: parseFloat(amount),
            date,
            currency,
            paymentMethod: { method, cardDetails: { cardNumber, expiryDate } },
            isIncoming: true,
            category,
            tags,
            isPaid: true,
        };

        await userCollection.updateOne(
            { id },
            { $push: { expenses: newIncome } }
        );

        res.redirect(`/showExpenses?id=${id}`);
    });

    // Formulier voor kosten toevoegen
    router.get("/addExpenses", async (req, res) => {
        const userId = req.query.id;

        const user = await userCollection.findOne({ id: userId });
        if (!user) {
            return res.status(404).send("Gebruiker niet gevonden");
        }
        res.render("addExpenses", { user });
    });

    // Kosten toevoegen
    router.post("/users/:id/expenses/addExpenses", async (req, res) => {
        const { id } = req.params;
        const { description, amount, date, currency, category, tags, isPaid, method, cardNumber, expiryDate } = req.body;

        const allowedCurrencies = ["EUR", "USD", "GBP"];
        if (!allowedCurrencies.includes(currency)) {
            return res.status(400).send("Ongeldige munteenheid. Alleen EUR, USD en GBP zijn toegestaan.");
        }

        const user = await userCollection.findOne({ id });
        if (!user) {
            return res.status(404).send("Gebruiker niet gevonden");
        }

        const newExpense: Expense = {
            id: uuidv4(),
            description,
            amount: parseFloat(amount),
            date,
            currency,
            paymentMethod: { method, cardDetails: { cardNumber, expiryDate } },
            isIncoming: false,
            category,
            tags,
            isPaid: isPaid === "yes",
        };

        await userCollection.updateOne(
            { id },
            { $push: { expenses: newExpense } }
        );

        res.redirect(`/showExpenses?id=${id}`);
    });

    // Alle transacties weergeven (inkomsten en uitgaven)
    router.get("/showExpenses", async (req, res) => {
        const { id, type = "", search = "" } = req.query;
        const users: User[] = await userCollection.find().toArray();
        // Filter de uitgaven per gebruiker
        const filteredUsers = users.map(user => {
            let filteredExpenses = user.expenses;

            // Filter op type
            if (type === "income") {
                filteredExpenses = filteredExpenses.filter(expense => expense.isIncoming);
            } else if (type === "expense") {
                filteredExpenses = filteredExpenses.filter(expense => !expense.isIncoming);
            }

            // Filter op zoekterm
            if (typeof search === 'string') {
                const searchLower = search.toLowerCase();
                filteredExpenses = filteredExpenses.filter(expense =>
                    expense.description.toLowerCase().includes(searchLower) ||
                    (expense.category && expense.category.toLowerCase().includes(searchLower))
                );
            }

            return { ...user, expenses: filteredExpenses };
        });

        // Render de pagina en geef de benodigde data door
        res.render('showExpenses', { users: filteredUsers, type, search });
    });



    // CRUD - UPDATE 
    router.get('/users/:userId/expenses/:expenseId/update', async (req, res) => {
        const { userId, expenseId } = req.params;

        const user = await userCollection.findOne({ id: userId });
        if (!user) {
            return res.status(404).send('Gebruiker niet gevonden');
        }

        const expense = user.expenses.find(exp => exp.id === expenseId);
        if (!expense) {
            return res.status(404).send('Uitgave niet gevonden');
        }

        res.render('updateExpenses', { userId, expense });
    });

    router.post('/users/:userId/expenses/:expenseId/update', async (req, res) => {
        const { userId, expenseId } = req.params;
        const { description, amount, date, currency, category, tags, isPaid } = req.body;

        // Nieuwe gegevens
        const updatedExpense = {
            id: expenseId,
            description,
            amount: parseFloat(amount),
            date,
            currency,
            category,
            tags,
            isPaid: isPaid === "yes"
        };

        const result = await userCollection.updateOne(
            { id: userId, "expenses.id": expenseId },
            { $set: { "expenses.$": updatedExpense } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Update mislukt: uitgave niet gevonden.");
        }

        res.redirect(`/showExpenses?id=${userId}`);
    });



    // CRUD - DELETE
    router.post('/users/:userId/expenses/:expenseId/delete', async (req, res) => {
        const { userId, expenseId } = req.params;

        const result = await userCollection.updateOne(
            { id: userId },
            { $pull: { expenses: { id: expenseId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send("Verwijderen mislukt: uitgave niet gevonden.");
        }

        res.redirect(`/showExpenses?id=${userId}`);
    });

    return router;
}
