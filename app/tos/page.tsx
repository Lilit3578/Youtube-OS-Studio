import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: February 2026

Welcome to ${config.appName}!

These Terms of Service ("Terms") govern your use of ${config.appName} (the "Website") and the services provided. By using our Website and services, you agree to these Terms.

1. Description of ${config.appName}

${config.appName} is a creator utility suite providing tools for YouTube creators, including comment exploration, thumbnail compression, metadata inspection, and QR code generation.

2. Usage Rights

You may use ${config.appName} tools for your personal and professional YouTube content creation. You agree not to misuse the service, including but not limited to automated scraping, circumventing rate limits, or using the tools for purposes that violate YouTube's Terms of Service.

3. User Data and Privacy

We collect and store user data, including name and email, as necessary to provide our services. For details on how we handle your data, please refer to our Privacy Policy at /privacy-policy.

4. Non-Personal Data Collection

We use web cookies to collect non-personal data for the purpose of improving our services and user experience.

5. YouTube API Data

${config.appName} uses the YouTube Data API to provide its tools. By using these tools, you also agree to YouTube's Terms of Service (https://www.youtube.com/t/terms). We do not store YouTube data beyond your active session.

6. Limitation of Liability

${config.appName} is provided "as is" without warranty of any kind. We are not liable for any damages arising from your use of the service, including but not limited to loss of data or interruption of service.

7. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email.

For any questions or concerns regarding these Terms of Service, please contact us at ${config.resend.supportEmail}.

Thank you for using ${config.appName}!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
