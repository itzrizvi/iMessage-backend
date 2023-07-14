import "next-auth";

declare module 'next-auth' {
    interface Session {
        user: User;
        expires: string;
    }
    interface User {
        id: string;
        username: string;
        image: string;
    }
}