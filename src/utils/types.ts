import { ISODateString } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  conversationPopulated,
  participantPopulated,
} from "../graphql/resolvers/conversations";
import { Context } from "graphql-ws/lib/server";
import { PubSub } from "graphql-subscriptions";

// Server Config

export interface GraphQLContext {
  session: Session;
  prisma: PrismaClient;
  pubsub: PubSub;
}

// User Interface
export interface Session {
  user: User;
  expires: ISODateString;
}

// Subscription Context
export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session;
  };
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
