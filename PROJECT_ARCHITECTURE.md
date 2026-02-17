Youtube OS Studio - High-Level Architecture (Revised)
High-Level Structure
The application is a Next.js 15+ App Router application with a strict separation between public access (Login) and the protected workspace (Dashboard/Tools).

Core Layers
Entry Layer: The Root (/) acts as the Login page for guests and automatically redirects authenticated users to the Dashboard.
Protected App Layer: A unified layout wrapper containing the Sidebar and Header. This wraps both the Dashboard home and all Tools/Features to ensure no layout unmounting/flicker when navigating.
Config Layer: Centralized configuration (
config.ts
) drives the Sidebar UI and "Coming Soon" states.
Data/API Layer: Server-side API routes handling YouTube data fetching and strictly enforcing rate limits via the database.
Routing Layout
The routing ensures a persistent Sidebar layout across all functional areas.

/ (Root) -> Renders Login (if guest) OR Redirects to /dashboard (if auth)
│
├── (protected)           # Route Group: Shared Layout (Sidebar/Header)
│   ├── /dashboard        # Dashboard Home (Tool cards)
│   │   └── /settings     # User Settings
│   │
│   └── /tools            # Tool Pages (Inherits Sidebar)
│       ├── /qr           # Feature 1: QR Generator
│       ├── /thumbnail    # Feature 2: Thumbnail Compressor
│       ├── /metadata     # Feature 3: Metadata Inspector
│       └── /comments     # Feature 4: Comment Explorer
│
└── API Routes
    ├── /api/auth/*       # NextAuth
    └── /api/youtube/*    # Protected + Rate Limited Wrapper
Proposed Folder/File Organization
/
├── app/
│   ├── page.tsx               # Login Page (Server Component: checks auth -> redirect or show form)
│   │
│   ├── (protected)/           # Shared Layout Group
│   │   ├── layout.tsx         # PERSISTENT LAYOUT (Sidebar + Session check)
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard Home
│   │   │
│   │   └── tools/
│   │       ├── qr/
│   │       │   └── page.tsx
│   │       ├── thumbnail/
│   │       │   └── page.tsx
│   │       ├── metadata/
│   │       │   └── page.tsx
│   │       └── comments/
│   │           └── page.tsx
│   │
│   └── api/
│       └── youtube/
│           ├── metadata/
│           │   └── route.ts   # Rate-limited endpoint
│           └── comments/
│               └── route.ts   # Rate-limited endpoint
│
├── components/                # Root-level components folder (Standard)
│   ├── layout/
│   │   ├── Sidebar.tsx        # Uses toolsConfig from config.ts
│   │   └── AppHeader.tsx
│   └── tools/
│       ├── qr/
│       ├── thumbnail/
│       └── ...
│
├── config.ts                  # Updated with toolsConfig
├── models/
│   └── User.ts                # Updated with usage counters
└── ...
Core Responsibility & Logic Changes
1. Unified Sidebar & Navigation (Config-Driven)
The Sidebar will NOT have hardcoded links. It will iterate over a toolsConfig array exported from 
config.ts
.

// config.ts
export const toolsConfig = [
  {
    id: "qr",
    name: "QR Generator",
    href: "/tools/qr",
    status: "active"
  },
  {
    id: "meta",
    name: "Metadata",
    href: "/tools/metadata",
    status: "active"
  },
  {
    id: "script-writer",
    name: "AI Script Writer",
    href: "#",
    status: "coming-soon"
  }
];
This allows "Coming Soon" placeholders to be managed easily.

2. Entry Point Logic
app/page.tsx
 will be a Server Component.
Logic:
Check Session.
If valid session: Redirect to /dashboard immediately.
If no session: Render the Login View (Visuals + "Login with Google" button).
There is no separate marketing landing page.
3. API Rate Limiting (Server-Side)
Rate limiting will be implemented strictly within the API Routes, NOT middleware.

Model Update: User model will gain a usage field.
usage: {
  metadata: { count: Number, date: Date },
  comments: { count: Number, date: Date }
}
Flow (/api/youtube/metadata):
Authenticate User (Session).
fetch User from DB.
Check if usage.metadata.date is today.
If not, reset count to 0.
Check if count < 20.
If YES: Call YouTube API, Increment count, Save DB, Return Data.
If NO: Return 429 Too Many Requests.
4. No Exposed API Keys
All YouTube Data API calls happen strictly on the server (/api/youtube/...).
Client components never see GOOGLE_API_KEY.
Client components fetch valid data from our own API.
Boundaries
Dashboard vs Tools: They are technically siblings in the route tree under 
(protected)
 but visually nested. The Layout is shared, preserving state.
Server vs Client: High-interactivity tools (QR, Thumbnail) are Client Components. Data tools (Metadata, Comments) use Client Components for UI but fetch data via our Server API Routes.