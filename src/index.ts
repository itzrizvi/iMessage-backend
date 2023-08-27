import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import express from "express";
import http from "http";
import cors from "cors";
import pkg from "body-parser";
const { json } = pkg;
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import dotenv from "dotenv";
import { GraphQLContext, Session, SubscriptionContext } from "./utils/types";
import { PrismaClient } from "@prisma/client";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";
import cookieParser from "cookie-parser";
import { getServerSession } from "./utils/getServerSession";
dotenv.config();

const corsOptions = {
  origin: [
    `${process.env.CLIENT_ORIGIN}`,
    `${process.env.CLIENT_ORIGIN_LOCAL}`,
  ],
  credentials: true,
};
// Context Params
const prisma = new PrismaClient();
// Pubsub
const pubsub = new PubSub();

const app = express();
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql/subscriptions",
});

// WebSocketServer start listening.
const serverCleanup = useServer(
  {
    schema,
    context: (ctx: SubscriptionContext): Promise<GraphQLContext> => {
      if (ctx.connectionParams && ctx.connectionParams.session) {
        const { session } = ctx.connectionParams;
        return Promise.resolve({ session, prisma, pubsub });
      }
      return Promise.resolve({ session: null, prisma, pubsub });
    },
  },
  wsServer,
);

const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: "bounded",
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ApolloServerPluginLandingPageLocalDefault({
      embed: true,
      includeCookies: true,
    }),
  ],
});
await server.start();
app.use(
  "/graphql",
  cors<cors.CorsRequest>(corsOptions),
  cookieParser(),
  json(),
  expressMiddleware(server, {
    context: async ({ req, res }): Promise<GraphQLContext> => {
      // Convert cookies object to a formatted string
      const cookies = Object.entries(req.cookies)
        .map(([name, value]) => {
          if (typeof value === "string") {
            return `${name}=${encodeURIComponent(value)}`;
          }
          return ""; // Handle invalid values if needed
        })
        .join("; ");

      // Assign the formatted cookies to req.headers.cookie
      req.headers.cookie = cookies;

      const session = await getServerSession(req.headers.cookie);
      return { session: session as Session, prisma, pubsub };
    },
  }),
);

await new Promise<void>((resolve) =>
  httpServer.listen({ port: process.env.PORT }, resolve),
);
console.log(
  `🚀 Server ready at http://localhost:4000/graphql \nTimestamp: ${new Date(
    Date.now(),
  )}`,
);
