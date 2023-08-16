import userResolvers from "./user";
import conversationResolvers from "./conversations";
import messageResolvers from "./message";
import merge from "lodash.merge";

const resolvers = merge(
  {},
  userResolvers,
  conversationResolvers,
  messageResolvers,
);

export default resolvers;
