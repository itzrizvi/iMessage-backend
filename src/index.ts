import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import express from 'express';
import http from 'http';
import cors from 'cors';
import pkg from 'body-parser';
const {json} = pkg;
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { makeExecutableSchema } from "@graphql-tools/schema";

interface MyContext {
    token?: String;
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
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }),
    }),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);