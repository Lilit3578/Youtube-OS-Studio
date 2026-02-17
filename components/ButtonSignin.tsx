/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { ERROR_MESSAGES } from "@/libs/constants/messages";

// Sign-in component: shows email + Google sign-in form when unauthenticated,
// or the user avatar link when authenticated.
const ButtonSignin = ({
  extraStyle,
}: {
  extraStyle?: string;
}) => {
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await signIn("email", {
        email,
        callbackUrl: config.auth.callbackUrl,
        redirect: false,
      });
      if (res?.ok) {
        setEmailSent(true);
      } else {
        const { toast } = await import("react-hot-toast");
        toast.error(res?.error || ERROR_MESSAGES.AUTH.SIGNIN_FAILED);
      }
    } catch {
      const { toast } = await import("react-hot-toast");
      toast.error(ERROR_MESSAGES.AUTH.SIGNIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: config.auth.callbackUrl });
  };

  if (status === "authenticated") {
    return (
      <Button asChild className={extraStyle} variant="default">
        <Link href={config.auth.callbackUrl}>
          {session.user?.image ? (
            <img
              src={session.user?.image}
              alt={session.user?.name || "Account"}
              className="w-6 h-6 rounded-full shrink-0 mr-2"
              referrerPolicy="no-referrer"
              width={24}
              height={24}
            />
          ) : (
            <span className="w-6 h-6 bg-slate-100 flex justify-center items-center rounded-full shrink-0 mr-2">
              {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
            </span>
          )}
          {session.user?.name || session.user?.email || "Account"}
        </Link>
      </Button>
    );
  }

  if (emailSent) {
    return (
      <div className="max-w-sm w-full space-y-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-ink-100 rounded-2xl">
              <Mail className="w-8 h-8 text-foreground" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-[28px] leading-[32px] font-serif font-normal text-foreground">
              check your email
            </h2>
            <p className="body text-muted-foreground">
              A sign-in link has been sent to{" "}
              <strong className="text-foreground">{email}</strong>. Click the
              link in the email to sign in.
            </p>
          </div>
          <button
            onClick={() => setEmailSent(false)}
            className="body text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors cursor-pointer"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm w-full space-y-10 text-center">
      {/* Title */}
      <h1 className="h1 italic">welcome</h1>


      <div className="flex flex-col space-y-6">
        {/* Email form */}
        <form onSubmit={handleEmailSignIn} className="space-y-2">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mario@gmail.com"
            required
            className="w-full h-10 px-4 rounded-full border border-border bg-background text-foreground placeholder:text-ink-700 focus:outline-none focus:ring-2 focus:ring-ring transition-colors body"
          />
          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full cursor-pointer"
          >
            {loading ? "Sending link..." : "Continue"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="label text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full cursor-pointer gap-2"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center body text-muted-foreground text-xs">
        By signing in, you agree to our{" "}
        <a
          href="/tos"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy-policy"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default ButtonSignin;
