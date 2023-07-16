import gql from "graphql-tag";


const typeDefs = gql`

    type CreateConversationResponse {
        conversationID: String
    }

    type Mutation {
        createConversation(participantIDs: [String]): CreateConversationResponse!
    }
`;

export default typeDefs;