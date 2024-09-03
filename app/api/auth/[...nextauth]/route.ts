import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

// Extend the built-in session types
interface ExtendedSession extends DefaultSession {
  accessToken?: string;
}

// Extend the built-in token types
interface ExtendedJWT extends JWT {
  accessToken?: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }): Promise<ExtendedJWT> {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        accessToken: (token as ExtendedJWT).accessToken,
      };
    },
  },
});

export { handler as GET, handler as POST };

