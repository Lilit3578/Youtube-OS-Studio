import Link from "next/link";
import config, { toolsConfig } from "@/config";
import { cn } from "@/libs/utils";
import { getSEOTags } from "@/libs/seo";
import { FileSearch, MessageSquare, Image as ImageIcon, QrCode, ArrowRight, type LucideIcon } from "lucide-react";

export const metadata = getSEOTags({
  title: `Dashboard | ${config.appName}`,
  description: "Your YouTube creator toolkit dashboard. Access all tools in one place.",
  extraTags: {
    robots: { index: false, follow: false },
  },
});

// Icon mapping for tools
const toolIcons: Record<string, LucideIcon> = {
  metadata: FileSearch,
  comments: MessageSquare,
  thumbnail: ImageIcon,
  qr: QrCode,
};

// Tool descriptions
const toolDescriptions: Record<string, string> = {
  metadata: "Inspect video tags and hidden metadata.",
  comments: "Explore and export video comments.",
  thumbnail: "Resize and compress thumbnails to YouTube standards.",
  qr: "Generate custom branded QR codes for your content.",
};

export default async function Dashboard() {
  return (
    <main className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="body text-muted-foreground">
          Choose a tool to get started with your YouTube content
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsConfig.map((tool) => {
          const Icon = toolIcons[tool.id as keyof typeof toolIcons];
          const description = toolDescriptions[tool.id as keyof typeof toolDescriptions];
          const isActive = tool.status === "active";
          const hasPage = tool.href !== "#";

          return (
            <Link
              key={tool.id}
              href={hasPage ? tool.href : "#"}
              className={cn(
                "group relative bg-card rounded-2xl border transition-all duration-300",
                "p-6 flex flex-col gap-4",
                isActive
                  ? "border-border hover:border-ink-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  : hasPage
                    ? "border-dashed border-ink-300 hover:border-ink-400 hover:opacity-80 cursor-pointer bg-ink-100 opacity-60"
                    : "border-dashed border-ink-300 opacity-50 cursor-not-allowed bg-ink-100"
              )}
            >
              {/* Icon + Title + Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                        : "bg-ink-200 text-muted-foreground"
                    )}
                  >
                    {Icon && <Icon className="w-5 h-5" strokeWidth={1.5} />}
                  </div>
                  <h3 className="text-lg font-medium text-foreground font-sans">
                    {tool.name}
                  </h3>
                </div>
                {!isActive && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-ink-200 text-muted-foreground font-medium uppercase tracking-wider">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="body text-muted-foreground leading-relaxed">
                {description}
              </p>

              {/* CTA */}
              {isActive ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:gap-2 transition-all mt-auto">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </div>
              ) : hasPage ? (
                <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:gap-2 transition-all mt-auto">
                  <span>Register Interest</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
