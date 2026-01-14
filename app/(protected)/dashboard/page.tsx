import Link from "next/link";
import { toolsConfig } from "@/config";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  return (
    <main className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsConfig.map((tool) => (
          <Link
            key={tool.id}
            href={tool.status === "active" ? tool.href : "#"}
            className={`card bg-base-100 shadow-xl border border-base-200 hover:border-primary transition-all duration-200 ${tool.status !== "active" ? "opacity-60 cursor-not-allowed" : "hover:shadow-2xl"
              }`}
          >
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title">{tool.name}</h2>
                {tool.status !== "active" && (
                  <div className="badge badge-ghost">Coming Soon</div>
                )}
              </div>
              <p className="text-base-content/70">
                {tool.id === "qr" && "Generate custom branded QR codes for your content."}
                {tool.id === "thumbnail" && "Resize and compress thumbnails to YouTube standards."}
                {tool.id === "metadata" && "Inspect video tags and hidden metadata."}
                {tool.id === "comments" && "Explore and export video comments."}
                {tool.id === "script-writer" && "AI-powered script writing assistant."}
              </p>
              {tool.status === "active" && (
                <div className="card-actions justify-end mt-4">
                  <span className="text-primary font-medium flex items-center gap-1">
                    Open Tool
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.79a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
