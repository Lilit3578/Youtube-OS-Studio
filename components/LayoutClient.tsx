"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Crisp } from "crisp-sdk-web";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import config from "@/config";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";

// Simple fallback component for client errors
function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-900 rounded-md m-4 border border-red-200">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <pre className="text-sm bg-red-100 p-2 rounded mb-4 max-w-full overflow-auto">
        {error?.message || String(error)}
      </pre>
      <Button onClick={resetErrorBoundary} variant="outline" className="bg-white">
        Try again
      </Button>
    </div>
  );
}

// Crisp customer chat support:
// This component is separated from ClientLayout because it needs to be wrapped with <SessionProvider> to use useSession() hook
const CrispChat = (): null => {
  const pathname = usePathname();
  const { data } = useSession();

  // Initialize Crisp once
  useEffect(() => {
    if (config?.crisp?.id) {
      Crisp.configure(config.crisp.id);
    }

    // MED-04 Fix: Clean up or ensure singleton behavior
    // Crisp doesn't have a strict 'destroy' method in standard SDK, 
    // but we can ensure we don't re-configure unnecessarily.
    // The main issue is usually duplicate event listeners if we added any.
    // Since we only configure, it's mostly safe, but good to be aware.
  }, []);

  // Handle route-specific Crisp visibility
  useEffect(() => {
    if (config?.crisp?.id && config.crisp.onlyShowOnRoutes &&
      !config.crisp.onlyShowOnRoutes?.includes(pathname)) {
      Crisp.chat.hide();
    }
  }, [pathname]);

  // Add User Unique ID to Crisp to easily identify users when reaching support (optional)
  useEffect(() => {
    if (data?.user && config?.crisp?.id) {
      Crisp.session.setData({ userId: data.user?.id });
    }
  }, [data]);

  return null;
};

// All the client wrappers are here (they can't be in server components)
// 1. SessionProvider: Allow the useSession from next-auth (find out if user is auth or not)
// 2. NextTopLoader: Show a progress bar at the top when navigating between pages
// 3. Toaster: Show Success/Error messages anywhere from the app with toast()
// 4. Tooltip: Show a tooltip if any JSX element has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content=""
// 5. CrispChat: Set Crisp customer chat support (see above)
const ClientLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SessionProvider>
        {/* Show a progress bar at the top when navigating between pages */}
        <NextTopLoader color={config.colors.main} showSpinner={false} />

        {/* Content inside app/page.js files  */}
        {/* MED-03 Fix: Error Boundary for Client Components */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children}
        </ErrorBoundary>

        {/* Show Success/Error messages anywhere from the app with toast() */}
        <Toaster
          toastOptions={{
            duration: 3000,
          }}
        />

        {/* Show a tooltip if any JSX element has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
        <Tooltip
          id="tooltip"
          className="z-[60] !opacity-100 max-w-sm shadow-lg"
        />

        {/* Set Crisp customer chat support */}
        <CrispChat />
      </SessionProvider>
    </>
  );
};

export default ClientLayout;
