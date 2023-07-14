import { ISODateString } from "next-auth";
import { PrismaClient } from "@prisma/client"

export interface GraphQLContext {
    session: Session;
    prisma: PrismaClient
    // pubsub
}

// User Interface
export interface Session {
    user: User;
    expires: ISODateString;
}

export interface User {
    id: string;
    username: string;
    image: string;
    email: string;
    emailVerified: Boolean;
    name: string;
}

export interface CreateUsernameResponse {
    success?: boolean;
    error?: string;
}