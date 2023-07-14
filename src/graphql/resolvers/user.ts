import { CreateUsernameResponse, GraphQLContext } from "../../utils/types";

const resolvers = {
    Query: {
        searchUsers: () => {},
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