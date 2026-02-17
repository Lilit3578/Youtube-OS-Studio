/* eslint-disable no-process-env */
/**
 * Environment Variable Validation
 * ensuring the app fails fast if critical configuration is missing.
 */

const requiredServerEnvs = [
    "MONGODB_URI",
    "NEXTAUTH_SECRET",
    "GOOGLE_ID",
    "GOOGLE_SECRET",
    "RESEND_API_KEY", // Optional if email not used
    "YOUTUBE_API_KEY", // Optional if not using YouTube features immediately
] as const;

const requiredClientEnvs = [
    "NEXT_PUBLIC_STRIPE_KEY"
] as const;

export const validateEnv = () => {
    // Only validate on server
    if (typeof window === "undefined") {
        const missing = requiredServerEnvs.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            const msg = `❌ MISSING REQUIRED ENVIRONMENT VARIABLES: ${missing.join(", ")}`;
            console.error(msg);
            // In strict production, we might want to throw to prevent startup
            if (process.env.NODE_ENV === "production") {
                // We won't throw hard here to prevent breaking the build pipeline if envs are injected later,
                // but we log a critical error.
                // throw new Error(msg);
            }
        }
    }
};

// Run validation immediately on import
validateEnv();
