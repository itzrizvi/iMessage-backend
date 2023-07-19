import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../utils/types";
import { Conversation, Prisma } from "@prisma/client";
// : Promise<Array<Conversation>>
const resolvers = {
  Query: {
    conversations: async (
      __: any,
      _: any,
      context: GraphQLContext,
    ): Promise<Array<Conversation>> => {
      const { session, prisma } = context;
      if (!session?.user) throw new GraphQLError("Not Authorized");

      const {
        user: { id: userID },
      } = session;

      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: {
                  equals: userID,
                },
              },
            },
          },
          include: conversationPopulated,
        });
        return conversations;
      } catch (error: any) {
        console.error(error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      __: any,
      args: { participantIDs: Array<string> },
      context: GraphQLContext,
    ): Promise<{ conversationID: string }> => {
      const { participantIDs } = args;
      const { session, prisma, pubsub } = context;
      if (!session?.user) throw new GraphQLError("Not Authorized");

      const {
        user: { id: userID },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIDs.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userID,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        //
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });

        return {
          conversationID: conversation.id,
        };
      } catch (error: any) {
        console.error(error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: (__: any, ___: any, context: GraphQLContext) => {
        const { pubsub } = context;
        pubsub.asyncIterator(["CONVERSATION_CREATED"]);
      },
    },
  },
};

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });
export default resolvers;
