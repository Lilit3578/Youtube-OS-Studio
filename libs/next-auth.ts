import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { Resend } from "resend";
import config from "@/config";
import connectMongo from "./mongoose";
import logger from "./logger";

// Validate required environment variables at startup
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    `Missing required environment variable: NEXTAUTH_SECRET\n` +
    `Please add it to your .env.local file.`
  );
}

// Optional Google OAuth credentials
const hasGoogleAuth = process.env.GOOGLE_ID && process.env.GOOGLE_SECRET;

export const authOptions: NextAuthConfig = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  providers: [
    // Google OAuth (optional - only enabled if credentials are provided)
    ...(hasGoogleAuth
      ? [
        GoogleProvider({
          // Follow the "Login with Google" tutorial to get your credentials
          clientId: process.env.GOOGLE_ID!,
          clientSecret: process.env.GOOGLE_SECRET!,
          allowDangerousEmailAccountLinking: true,
          profile(profile) {
            return {
              id: profile.sub,
              name: profile.given_name ? profile.given_name : profile.name,
              email: profile.email,
              image: profile.picture,
              createdAt: new Date(),
            };
          },
        }),
      ]
      : []),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    EmailProvider({
      server: { host: "smtp.resend.com", port: 465, auth: { user: "resend", pass: process.env.RESEND_API_KEY || "" } },
      from: config.resend.fromNoReply,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        logger.info({ event: "email_verification_requested" }, "Attempting to send verification email");

        try {
          const { data, error } = await resend.emails.send({
            from: provider.from as string,
            to: email,
            subject: `Sign in to ${config.appName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
                  <h2 style="color: #141414; font-size: 20px; margin-bottom: 16px;">Sign in to ${config.appName}</h2>
                  <p style="color: #525252; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                    Click the button below to sign in. This link expires in 24 hours.
                  </p>
                  <a href="${url}" style="display: inline-block; background: #141414; color: #fefefe; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-size: 14px;">
                    Sign in
                  </a>
                  <p style="color: #a3a3a3; font-size: 12px; margin-top: 32px;">
                    If you didn&apos;t request this email, you can safely ignore it.
                  </p>
                </div>
              `,
          });

          if (error) {
            logger.error({ error }, "Resend API Error");
            throw new Error("Failed to send verification email: " + error.message);
          }

          logger.info({ dataId: data?.id }, "Verification email sent successfully");
        } catch (error) {
          logger.error({ error }, "Unexpected Error in sendVerificationRequest");
          throw error;
        }
      },
    }),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  adapter: MongoDBAdapter(
    connectMongo().then((mongoose) => {
      return mongoose.connection.getClient() as unknown as import("mongodb").MongoClient;
    })
  ),

  callbacks: {
    signIn: async ({ user, account }) => {
      // Add custom fields to user document on sign in
      if (user && account) {
        try {
          // CRIT-02 FIX: Force connection before any DB operation
          await connectMongo();

          // Import User model dynamically to avoid circular dependencies
          const { default: User } = await import("@/models/User");

          // ATOMIC: Use findOneAndUpdate with upsert for idempotency
          // This replaces the "find, check, then update" logic which is race-prone
          await User.updateOne(
            { email: user.email },
            {
              $addToSet: { authProviders: account.provider },
              $setOnInsert: {
                usage: {
                  metadataInspector: { count: 0, lastResetDate: new Date() },
                  commentExplorer: { count: 0, lastResetDate: new Date() },
                  toolRequests: { count: 0, lastResetDate: new Date() },
                },
              },
            },
            { upsert: true } // Create if doesn't exist
          );

          // logger.info("User sign-in processed atomically");
        } catch (error) {
          logger.error({ error }, "Auth Callback Error");
          // Fail safe: don't let broken users in if we can't verify their state
          // In a high-security context, this should return false. 
          // However, for availability, if the DB update fails but Auth Provider succeeded, 
          // we might want to let them in. 
          // DECISION: Return false to prevent "ghost" users without DB records.
          return false;
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name;
        session.user.email = token.email ?? "";
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/",
  },
  theme: {
    brandColor: config.colors.main,
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
