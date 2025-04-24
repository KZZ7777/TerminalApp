import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId; // MongoDB ObjectId
    id: string;
    name: string;
    email: string;
    password: string;
    expenses: Expense[];
    budget: Budget;
}

export interface Budget {
    monthlyLimit: number;
    notificationThreshold: number;
    isActive: boolean;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    currency: string;
    paymentMethod: PaymentMethod;
    isIncoming: boolean;
    category: string;
    tags: string[];
    isPaid: boolean;
}

export interface PaymentMethod {
    method: string;
    cardDetails: CardDetails;
}

export interface CardDetails {
    cardNumber: string;
    expiryDate: string;
}