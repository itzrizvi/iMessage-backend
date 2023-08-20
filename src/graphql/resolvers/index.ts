import userResolvers from "./user";
import conversationResolvers from "./conversations";
import messageResolvers from "./message";
import scalarsResolvers from "./scalars";
import merge from "lodash.merge";

const resolvers = merge(
  {},
  userResolvers,
  conversationResolvers,
  messageResolvers,
  scalarsResolvers,
);

export default resolvers;
