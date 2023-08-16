import { GraphQLError } from "graphql";
import { GraphQLContext, SendMessageArguments } from "../../utils/types";
import { Prisma } from "@prisma/client";

const resolvers = {
  Query: {},
  Mutation: {
    sendMessage: async function (
      _: any,
      args: SendMessageArguments,
      context: GraphQLContext,
    ): Promise<boolean> {
      const { session, prisma, pubsub } = context;
      const { id: userId } = session.user;
      const { id: messageId, senderId, conversationId, body } = args;

      if (!session?.user || userId !== senderId)
        throw new GraphQLError("Not Authorized");

      try {
        // Create New Message
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        // Update Conversation Entity
        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: senderId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId: senderId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
        });

        // Subscription Update
        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
        // pubsub.publish("CONVERSATION_UPDATED", {
        //   conversationUpdated: {
        //     conversation,
        //   },
        // });
      } catch (error: any) {
        console.error(error);
        throw new GraphQLError(error?.message);
      }

      return true;
    },
  },
  Subscription: {},
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export default resolvers;
