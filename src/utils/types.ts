import { ISODateString } from 'next-auth';
import { Prisma, PrismaClient } from '@prisma/client';
import {
    conversationPopulated,
    participantPopulated,
} from '../graphql/resolvers/conversations';

export interface GraphQLContext {
    session: Session;
    prisma: PrismaClient;
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

// Converations
export type ConversationPopulated = Prisma.ConversationGetPayload<{
    include: typeof conversationPopulated;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
    include: typeof participantPopulated;
}>;
