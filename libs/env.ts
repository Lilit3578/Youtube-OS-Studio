/* eslint-disable no-process-env */
import logger from "./logger";
/**
 * Environment Variable Validation
 * ensuring the app fails fast if critical configuration is missing.
 */

// Note: GOOGLE_ID and GOOGLE_SECRET are conditionally required.
// They are only needed when using Google OAuth, which is mutually
// exclusive with email (magic link) auth. next-auth.ts handles their
// absence gracefully via the `hasGoogleAuth` check.
const requiredServerEnvs = [
    "MONGODB_URI",
    "NEXTAUTH_SECRET",
    "RESEND_API_KEY",
    "YOUTUBE_API_KEY",
    "ADMIN_EMAIL",
] as const;

const requiredClientEnvs = [] as const;

export const validateEnv = () => {
    // Only validate on server
    if (typeof window === "undefined") {
        const missing = requiredServerEnvs.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            const msg = `MISSING REQUIRED ENVIRONMENT VARIABLES: ${missing.join(", ")}`;
            logger.error({ missing }, msg);
            if (process.env.NODE_ENV === "production") {
                throw new Error(msg);
            }
        }
    }
};

// Run validation immediately on import
validateEnv();
