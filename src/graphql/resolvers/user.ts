import { GraphQLError } from "graphql";
import { CreateUsernameResponse, GraphQLContext } from "../../utils/types";
import { User } from "@prisma/client";

const resolvers = {
    Query: {
        searchUsers: async (
            __: any, 
            args: { username: string }, 
            context: GraphQLContext
        ): Promise<Array<User>> => {
            const { username: searchedUsername } = args;
            const { session, prisma } = context;
            if(!session?.user) throw new GraphQLError("Not Authorized");

            const { 
                user: { username: myUserame}
            } = session;

            try {

                const users = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: searchedUsername,
                            not: myUserame,
                            mode: 'insensitive'
                        }
                    }
                });

                return users;
                
            } catch (error:any) {
                console.error(error);
                throw new GraphQLError(error?.message);
                
            }

        },
    },
    Mutation: {
        createUsername: async (
                __: any, 
                args: { username: string }, 
                context: GraphQLContext
            ): Promise<CreateUsernameResponse> => {
                const { username } = args;
                const { session, prisma } = context;
                
                if(!session?.user) return Promise.resolve({ error: "Not Authorized" });

                const { id: userID } = session.user;

                try {
                    // Check User name unique
                    const existingUser = await prisma.user.findUnique({
                        where: {
                            username
                        }
                    });
                    if(existingUser) return Promise.resolve({ error:"Username is already taken, try another" });

                    await prisma.user.update({
                        where:{
                            id: userID
                        },
                        data: {
                            username
                        }
                    });
                    return { success:true };
                    
                } catch (error: any) {
                    console.error("CREATE USER NAME ERROR", error);
                    return Promise.resolve({ error: error?.message });
                }
            },
    }
}

export default resolvers;