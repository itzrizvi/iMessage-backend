import { ISODateString } from "next-auth";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  conversationPopulated,
  participantPopulated,
} from "../graphql/resolvers/conversations";
import { Context } from "graphql-ws/lib/server";
import { PubSub } from "graphql-subscriptions";
import { messagePopulated } from "../graphql/resolvers/message";

// Server Config

export interface GraphQLContext {
  session: Session;
  prisma: PrismaClient;
  pubsub: PubSub;
}

export interface User {
  id: string;
  username: string;
  image: string;
  email: string;
  emailVerified: Boolean;
  name: string;
}

// User Interface
export interface Session {
  user: User;
  expires: ISODateString;
  authToken: string;
}

// Subscription Context
export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session;
  };
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

export interface ConversationUpdatedSubscriptionPayload {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}

export interface ConversationDeletedSubscriptionPayload {
  conversationDeleted: ConversationPopulated;
}

// Messages
export interface SendMessageArguments {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}
export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;
export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}
