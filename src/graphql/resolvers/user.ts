const resolvers = {
    Query: {
        searchUsers: () => {},
    },
    Mutation: {
        createUsername: (__: any, args: { username: string }, context: any) => {
            const { username } = args;
            console.log(username);
        },
    }
}

export default resolvers;