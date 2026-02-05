import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import ButtonSignin from "@/components/ButtonSignin";

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect(config.auth.callbackUrl);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-8 text-center gap-8">
      <div>
        <h1 className="text-[56px] leading-[56px] font-serif font-normal mb-4">{config.appName}</h1>
        <p className="body opacity-80 max-w-md mx-auto">{config.appDescription}</p>
      </div>

      <div className="card w-full max-w-sm shadow-2xl bg-card border border-border">
        <div className="card-body gap-4">
          <h2 className="card-title justify-center text-center text-[20px] leading-[28px] font-serif">Welcome Back</h2>
          <ButtonSignin text="Login with Google" extraStyle="btn-primary w-full" />
          <p className="caption text-center opacity-60">
            By logging in, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </main>
  );
}
