// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { getDb, getUserByEmail, createOAuthUser } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    // Existing Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        const db = getDb();
        const user = db
          .prepare("SELECT * FROM users WHERE email = ?")
          .get(credentials.email);

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Check if user signed up with OAuth
        if (!user.password) {
          throw new Error(
            `This email is registered with ${user.provider}. Please sign in with ${user.provider}.`
          );
        }

        // Check if email is verified
        if (user.email_verified === 0) {
          throw new Error("Please verify your email before logging in");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          lastName: user.last_name,
          avatar: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          // FIX 3: Ensure OAuth emails are also handled as lowercase for consistency
          const email = user.email.toLowerCase();

          const name = user.name || profile?.name || email.split("@")[0];
          const avatar =
            user.image ||
            profile?.avatar_url || // GitHub
            profile?.picture; // Google

          // Create or link user
          const dbUser = createOAuthUser(
            email,
            name,
            avatar,
            account.provider,
            account.providerAccountId
          );

          // Update user object with database ID
          user.id = dbUser.id.toString();
          user.avatar = dbUser.avatar;

          return true;
        } catch (error) {
          console.error("OAuth sign in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.avatar = user.avatar;
        token.lastName = user.lastName;
      }

      if (account?.provider === "google" || account?.provider === "github") {
        // Note: Make sure getUserByEmail inside your db.js also handles case-sensitivity
        // if you want this to be perfectly robust, though usually OAuth returns consistent emails.
        const dbUser = getUserByEmail(token.email);
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.avatar = dbUser.avatar;
          token.lastName = dbUser.last_name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.avatar = token.avatar;
        session.user.lastName = token.lastName;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
