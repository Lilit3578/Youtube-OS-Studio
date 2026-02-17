import { redirect } from "next/navigation";
import { auth } from "@/libs/next-auth";
import config from "@/config";
import { getSEOTags, renderSchemaTags } from "@/libs/seo";
import ButtonSignin from "@/components/ButtonSignin";

export const metadata = getSEOTags({
  title: `${config.appName} - Creator Utility Suite for YouTube`,
  description: config.appDescription,
  canonicalUrlRelative: "/",
  openGraph: {
    title: `${config.appName} - Creator Utility Suite for YouTube`,
    description: config.appDescription,
  },
});

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect(config.auth.callbackUrl);
  }

  return (
    <>
      {renderSchemaTags()}
      <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 gap-8">
        {/* Logo */}
        <div className="h2 text-foreground italic flex items-center gap-1">
          <span>youtube</span>
          <span>OS</span>
        </div>

        <ButtonSignin />
      </main>
    </>
  );
}
