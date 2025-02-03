import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { username: string; uid: string }).username =
          session.user.name?.split(" ").join("").toLowerCase() ?? "";

        (session.user as { username: string; uid: string }).uid =
          token.sub ?? "";
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
