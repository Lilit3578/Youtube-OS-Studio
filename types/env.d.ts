declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production" | "test";
        NEXTAUTH_SECRET: string;
        MONGODB_URI: string;
        GOOGLE_ID?: string;
        GOOGLE_SECRET?: string;
        RESEND_API_KEY?: string;
        STRIPE_SECRET_KEY?: string;
        STRIPE_WEBHOOK_SECRET?: string;
        LOG_LEVEL?: string;
    }
}
