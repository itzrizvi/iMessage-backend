import { GraphQLContext } from "../../utils/types";

const resolvers = {
    Mutation: {
        createConversation: async (__:any, args: { participantIDs: Array<string> }, context: GraphQLContext) => {
            console.log("INSIDE CONVERSATION");
            console.log(args);
        },
    }
}

export default resolvers;