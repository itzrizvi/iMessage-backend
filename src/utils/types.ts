import { Session } from "next-auth";

export interface GraphQLContext {
    session: Session;
    // prisma
    // pubsub
}