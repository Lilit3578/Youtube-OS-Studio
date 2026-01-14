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
        <h1 className="text-4xl font-extrabold mb-4">{config.appName}</h1>
        <p className="text-lg opacity-80 max-w-md mx-auto">{config.appDescription}</p>
      </div>

      <div className="card w-full max-w-sm shadow-2xl bg-base-100 border border-base-200">
        <div className="card-body gap-4">
          <h2 className="card-title justify-center text-center">Welcome Back</h2>
          <ButtonSignin text="Login with Google" extraStyle="btn-primary w-full" />
          <p className="text-xs text-center opacity-60">
            By logging in, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </main>
  );
}
