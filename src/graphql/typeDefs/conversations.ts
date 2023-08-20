import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date

  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }

  type Conversation {
    id: String
    latestMessage: Message
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }

  type CreateConversationResponse {
    conversationID: String
  }

  type Mutation {
    createConversation(participantIDs: [String]): CreateConversationResponse!
    markConversationAsRead(userId: String!, conversationId: String!): Boolean
  }

  type Query {
    conversations: [Conversation]
  }

  type Subscription {
    conversationCreated: Conversation
  }
`;

export default typeDefs;
