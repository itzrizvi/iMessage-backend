import fetch from "node-fetch";
export const getServerSession = async (cookie: string) => {
    const res = await fetch(`${process.env.SESSION_URL}`,{
        headers: { cookie: cookie },
    });
    const session = await res.json();
    return session;
};