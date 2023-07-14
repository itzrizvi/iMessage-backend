import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import express from 'express';
import http from 'http';
import cors from 'cors';
import pkg from 'body-parser';
const { json } = pkg;
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { makeExecutableSchema } from "@graphql-tools/schema";
import dotenv from 'dotenv';
import { getServerSession } from './utils/getServerSession';
import { GraphQLContext } from './utils/types';
import { Session } from "next-auth";
dotenv.config();


interface MyContext {
    // token: String;
}

const corsOptions = {
    origin: [`${process.env.CLIENT_ORIGIN}`],
    credentials: true
}

const app = express();
const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});
const httpServer = http.createServer(app);
const server = new ApolloServer<MyContext>({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageLocalDefault({ embed:true })
    ],
});
await server.start();
app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
        context: async ({ req, res }): Promise<GraphQLContext> => { 
            const session = await getServerSession(req.headers.cookie) as Session | null;
            console.log(session);
            return { session }
        }
    }),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);