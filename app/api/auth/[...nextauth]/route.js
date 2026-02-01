// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { queryOne, getUserByEmail, createOAuthUser } from "@/lib/db";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.given_name || profile.name?.split(" ")[0], // First name
          lastName:
            profile.family_name || profile.name?.split(" ").slice(1).join(" "), // Last name
          image: profile.picture,
        };
      },
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      profile(profile) {
        // GitHub doesn't provide separate first/last names, so we split
        const nameParts = (profile.name || profile.login || "")
          .trim()
          .split(" ");
        const firstName =
          nameParts.length > 1
            ? nameParts.slice(0, -1).join(" ")
            : nameParts[0] || profile.login;
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        return {
          id: profile.id.toString(),
          email: profile.email,
          name: firstName,
          lastName: lastName,
          image: profile.avatar_url,
        };
      },
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

        const email = credentials.email.toLowerCase().trim();
        const user = await queryOne("SELECT * FROM users WHERE email = ?", [email]);

        if (!user || !user.password) {
          // Return a generic error message to prevent user enumeration.
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          // Return a generic error message to prevent timing attacks and user enumeration.
          throw new Error("Invalid credentials");
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
          const email = user.email.toLowerCase();

          // user.name and user.lastName are already parsed in the profile callbacks above
          const firstName = user.name || email.split("@")[0];
          const lastName = user.lastName || "";
          const avatar = user.image;

          // Create or link user with separate first and last names
          const dbUser = await createOAuthUser(
            email,
            firstName,
            lastName,
            avatar,
            account.provider,
            account.providerAccountId,
          );

          // Update user object with database ID
          user.id = dbUser.id.toString();
          user.avatar = dbUser.avatar;
          user.lastName = dbUser.last_name;

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
        const dbUser = await getUserByEmail(token.email);
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
