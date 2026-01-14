## Youtube OS Studio

Creator Utilities Suite

---

## 1. Product Idea

### Product Overview

The product is a **creator utility dashboard ("YouTube OS")** that acts as a central workspace for high-utility, single-purpose tools designed for YouTube creators.

Users sign up or log in once, land on a **persistent dashboard**, and can switch between tools via a sidebar without leaving the app context.

The system is intentionally designed as:

- A **tool OS**, not a content platform
- Modular and extensible (tools can be added later)
- Transparent, fast, and non-AI by default

The dashboard architecture explicitly supports:

- Multiple tools (current + future)
- "Coming soon" placeholders
- User-requested tools (future)
- Account management and settings

No creator content, URLs, images, or comments are stored beyond the active session.

### Product Principles

The product is a **lightweight, creator-first utility suite** designed to solve common, high-friction problems YouTube creators face during publishing, distribution, and audience research — **without AI interpretation, lock-in, or data storage**.

The app focuses on:

- Transparency over automation
- Utility over dashboards
- Speed over complexity

Each tool is intentionally **single-purpose**, **fast**, and **export-friendly**, allowing creators to plug outputs into their own workflows (Excel, ChatGPT, Notion, editors, etc.).

The initial release ships with **four standalone tools**, unified by a shared UI, auth system (passwordless via Google OAuth or email magic links), and usage limits.

---

## 2. Target Users

- YouTube creators (small to mid-sized)
- Content strategists
- Social media managers
- Indie creators and solopreneurs

Non-goals:

- No analytics dashboards
- No performance prediction
- No AI-generated insights

---

## 3. Feature Set (Initial Release)

The initial release ships with **four production-ready tools**, all accessible from the dashboard sidebar.

Each tool:

- Opens inside the main dashboard content area
- Shares global auth, layout, and applicable rate-limiting rules
- Is implemented as an isolated module (route + components)

Navigation also includes:

- Home dashboard page
- Settings page
- Logout action
- Coming-soon tools (non-functional placeholders)
- Tool request entry point (future)

---

### Feature 1: QR Code Generator (Customizable, Static)

## Purpose

Allow users to generate **custom, branded static QR codes** for YouTube videos, channels, playlists, blogs, or any valid URL, suitable for **digital and print use**.

This feature is a **high-utility, high-polish tool** designed to feel premium while remaining simple and fast.

---

## Primary Value

- Create visually branded QR codes without third-party tools
- Full customization (colors, shapes, logos)
- Multiple export formats and sizes
- Works for creators, bloggers, and businesses

---

## Supported Inputs

- Any valid public URL
    - YouTube video
    - YouTube channel
    - YouTube playlist
    - Blog posts
    - Landing pages
    - Any website

No restriction on URL type.

---

## Behavior

### Core Behaviour

- QR code is generated **instantly** when:
    - A valid URL is entered
    - Any customisation option changes
- Rendering is fully **client-side**
- No backend calls are made for QR generation

---

### 2️⃣ Shape / Style

- Square (default)
- Rounded
- Dots

No gradients or advanced styling in V1.

---

### 3️⃣ Logo Embedding (Optional)

- User can upload a logo (PNG / JPG)
- Logo is centered inside the QR code
- Automatically scaled (~20% of QR size)
- Transparent backgrounds recommended

**Validation**

- File type: PNG, JPG
- Max size: ~1MB

---

### 4️⃣ Error Correction Level

- Low
- Medium (default)
- High (recommended when logo is used)

Helper text explains trade-offs.

---

## Download Options

### File Formats

- **PNG** (default)
- **SVG**

All exports are generated client-side.

---

### Size Presets

| Label | Size (px) | Recommended Use |
| --- | --- | --- |
| Small | 256 × 256 | Screens / mobile |
| Medium | 512 × 512 | Web / social |
| Large | 1024 × 1024 | Print |
| Very Large | 2048 × 2048 | Posters / banners |

User selects size before downloading.

---

## User Interaction Flow

1. User opens **QR Code Generator**
2. User pastes a URL
3. QR code appears instantly
4. URL type label is shown
5. User customizes:
    - shape
    - logo (optional)
    - error correction
6. QR preview updates live
7. User selects:
    - size
    - format
8. User downloads QR code

No submit button, no saving, no history.

---

## Empty & Error States

### Empty State

- No URL entered
- Show placeholder QR graphic
- Instruction text:

> “Paste a URL to generate a QR code”
> 

---

### Invalid URL

- Inline validation message:

> “Please enter a valid URL”
> 
- QR preview hidden or disabled

---

### Logo Error

- If logo fails to load:

> “Logo could not be applied”
> 

---

### Unsupported Logo File

- Triggered when logo file type is not supported **or** file exceeds size limits
- Logo preview hidden or fallback to QR without logo

> “Unsupported logo file. Please upload a PNG or JPG under X MB.”
> 

*(Optional: replace X with actual limit, e.g. 2 MB)*

---

### Browser Download Blocked

- Triggered when browser blocks automatic download
- QR is still generated and visible

> “Download blocked by your browser. Please allow downloads or use the manual download button.”
> 

---

## Authentication & Access

- Tool is accessible only to signed-in users
- No QR codes or URLs are stored
- No per-user history or counters

---

## Dependencies (Locked)

### Client-side Libraries

- **`qr-code-styling`** → QR generation (SVG, PNG, logo, shapes, error correction)

### Backend

- ❌ No YouTube API
- ❌ No database usage for this feature

---

### Feature 2: YouTube Thumbnail Compressor & Resizer

## Purpose

Allow users to upload an image and automatically **resize, crop, and compress it** to meet **YouTube thumbnail requirements**, ensuring fast uploads and optimal quality.

This tool removes guesswork and prevents common upload errors.

---

## Primary Value

- Guarantees YouTube-compliant thumbnails
- Reduces file size without visible quality loss
- Instant preview and download
- No third-party tools required

---

## YouTube Thumbnail Requirements (Enforced)

- **Resolution:**
    - **Primary:** 1920 x 1080 pixels (if input allows)
    - **Minimum**: 1280 × 720 pixels
- **Aspect ratio:** 16:9
- **Max file size:** ≤ 2MB
- **Formats supported by YouTube:** JPG, PNG

These constraints are **hard-coded** into the tool.

---

## Supported Inputs

- Image upload only
    - JPG
    - PNG

Max input size: **10MB** (soft limit, client-side only).

---

## Behavior

### Core Behaviour

- When an image is uploaded:
    - The image is loaded client-side
    - It is resized to **1280 × 720**
    - **Smart Resolution Logic:**
        - If original width ≥ 1920px → Resize/Crop to **1920 x 1080**.
        - If original width < 1920px → Resize/Crop to **1280 x 720**.
    - Aspect ratio is enforced
    - Image is compressed until it is **≤ 2MB**
- Preview updates instantly
- No backend processing

---

## Resize & Crop Logic

### Aspect Ratio Handling

If the uploaded image is **not 16:9**:

- Default behavior: **center crop**
- No stretching or distortion

---

## Compression Strategy

- Compression is **adaptive**
- Start at high quality
- Reduce quality gradually until:
    - File size ≤ 2MB
    - Minimum quality threshold reached

Defaults:

- Initial quality: 0.9
- Minimum quality: 0.6

If the file cannot reach ≤2MB:

- Show warning:
    
    > “Image could not be compressed below 2MB without significant quality loss.”
    > 

---

## User Interaction Flow

1. User opens **Thumbnail Compressor**
2. User uploads an image
3. Original image preview is shown
4. Processed thumbnail preview appears
5. User sees:
    - Original size
    - Final size
6. User downloads optimised thumbnail

No submit button.

---

## UI Elements

### Required

- Image upload area (drag & drop + click)
- Original image preview
- Optimised image preview
- File size comparison
- Download button

---

## Download Options

### File Format

- JPG (default, recommended)
- PNG (optional, larger files)

---

## Empty & Error States

### Empty State

- No image uploaded
- Show instruction text:

> “Upload an image to optimise it for YouTube thumbnails”
> 

---

### Unsupported File Format

- Triggered when file is not JPG or PNG
- Block upload and processing

> “Unsupported file format. Only JPG and PNG images are supported.”
> 

---

### File Too Large

- Triggered when image exceeds maximum upload size
- Block processing

> “This image is too large. Please upload a smaller file.”
> 

*(Optional: specify limit, e.g. “under 10 MB”)*

---

### Compression Limit Reached

- Triggered when compression cannot reduce file to ≤2MB
- Image preview shown, but export disabled

> “Unable to compress image to 2MB or less without significant quality loss.”
> 

---

### Browser Memory / Canvas Error

- Triggered by browser limitations (low memory, canvas crash, large dimensions)
- Processing halted

> “Image processing failed due to browser limitations. Please try a smaller image or refresh the page.”
> 

---

### Compression Failure (Generic)

- Inline warning message (non-blocking)

> “Image compression failed. Please try again.”
> 

---

## Authentication & Access

- Tool is accessible only to signed-in users
- No usage limits or counters are applied
- No images or usage data are stored
- No history saved

---

## Dependencies (Locked, No Interpretation)

### Client-side Libraries

### **Image Processing**

- **`browser-image-compression`**

Why:

- Client-side only
- Supports max size constraints
- Actively maintained
- Handles large images safely

---

### **Canvas Utilities**

- Native `<canvas>` API
    
    (No additional libraries needed)
    

---

## Backend Dependencies

- ❌ No YouTube API
- ❌ No database usage
- ❌ No image uploads to server

---

### Feature 3: Video Metadata & Tags Inspector

## Purpose

Allow users to inspect the **public, factual metadata and configuration flags** of any YouTube video using a single URL, helping creators understand **how a video is structured, classified, and restricted** by YouTube.

This feature is **informational only** — it does not attempt to infer performance or algorithmic behaviour.

---

## Primary Value

- Surface metadata creators usually never see
- Expose compliance & restriction flags
- Improve SEO and localisation awareness
- Build trust through transparency and accuracy

---

## Supported Inputs

- Any public YouTube video URL
- `youtu.be` short links
- `youtube.com/shorts/` URLs
- `youtube.com/live/` URLs (Livestreams)
- Embedded video URLs

Unsupported:

- Private videos
- Deleted videos
- Region-blocked videos (partial data)

---

## YouTube API Usage (Locked)

### Endpoint

```
videos.list

```

### Parts Requested

```
snippet
contentDetails
statistics
status
topicDetails(optional, when available)

```

⚠️ One API call per analysis.

---

## User Interaction Flow

1. User opens **Video Metadata & Tags Inspector**
2. Empty state is shown with instructions
3. User pastes a YouTube video URL
4. Video ID is extracted and validated
5. Single API request is made
6. Metadata is displayed in grouped sections
7. User can expand/collapse sections
8. User may copy tags or metadata fields

No saving, no automatic file exports, no history.

---

## UI Structure & Display

### 1️⃣ Video Overview

**Displayed fields**

- Video title
- Channel name
- Publish date
- Video thumbnail
- Description (collapsed by default)

**UI Notes**

- “Show more” for long descriptions
- Copy button for description text
- Must display "Data provided by YouTube" with the standard YouTube logo to comply with API Terms of Service.

---

### 2️⃣ SEO & Metadata

**Displayed fields**

- Tags (if accessible)
- Tag count
- Title length (characters)
- Description length (characters)
- Hashtags detected
- Links detected
- Timestamps detected

**Tags behaviour**

- If available → display as copyable chips
- If unavailable → show info message:
    
    > “Tags are not publicly accessible for this video.”
    > 

---

### 3️⃣ Technical Details

**Displayed fields**

- Duration (HH:MM:SS)
- Format:
    - Short (< 60s)
    - Long-form
- Definition (HD / SD)
- Captions available (Yes / No)

---

### 4️⃣ Content Compliance & Restrictions

**Displayed flags**

- Made for kids
- Age restriction
- Embeddable
- Region restrictions:
    - Allowed regions
    - Blocked regions (if any)

**UI Notes**

- Display as labeled badges
- Neutral colour coding (no warnings)

---

### 5️⃣ Content Classification (YouTube-Inferred)

**Displayed when available**

- Content category ID
- Topic categories (if returned)
- Default metadata language
- Default audio language

**Missing data handling**

- If not returned:
    
    > “This data is not available for this video.”
    > 

No inference or scoring.

---

### 7️⃣ Engagement Stats (Context Only)

**Displayed**

- Views
- Likes
- Comments count

**Explicit disclaimer**

> “Displayed for context only. No performance analysis is applied.”
> 

---

## Empty & Error States

### Empty State

- No URL entered
- Show instruction text:

> “Paste a YouTube video URL to inspect its metadata.”
> 

---

### Invalid YouTube URL

- Triggered when URL is malformed or not a valid YouTube video link
- Block inspection

> “Please enter a valid YouTube video URL.”
> 

---

### Video Not Found / Private / Restricted

- Triggered when video ID exists but is unavailable
- Block inspection

> “This video is unavailable, private, or restricted.”
> 

---

### YouTube API Quota Exceeded

- Triggered when API request limit is reached
- Inspection disabled temporarily

> “YouTube data limit reached. Please try again later.”
> 

---

### Network Failure

- Triggered by connectivity issues or request timeout
- Non-destructive (user can retry)

> “Network error. Please check your connection and try again.”
> 

---

### Generic API Error

- Catch-all for unexpected API failures
- Fallback state

> “Unable to fetch video data. Please try again later.”
> 

---

## Authentication & Access

- Requires signed-in user
- Rate Limit: 20 requests per day per user.
- No video IDs or metadata stored

---

## Dependencies

### Backend

- YouTube Data API v3

### Client

- URL parser
- No additional third-party libraries required

---

### Feature 4: Comment Explorer (Audience Signals)

## Purpose

Give creators **direct access to relevant audience comments**, **organised by intent**, while preserving the **original wording** so users can form their own conclusions or **export the data for further analysis** (e.g. pasting into ChatGPT or opening in Excel).

This tool **organises comments** — it does not interpret or rewrite them.

---

## Primary Value

- Surface real audience signals
- Preserve original comment context
- Avoid AI hallucinations or misinterpretation
- Enable creators to do their own analysis
- Allow comments to be exported for offline use or tooling

---

## Supported Inputs

- Any public YouTube video URL
- `youtu.be` short links
- `youtube.com/shorts/` URLs

Unsupported:

- Private videos
- Videos with disabled comments
- Community posts

---

## YouTube API Usage (Locked)

### Endpoint

```
commentThreads.list

```

### Parameters

```
part=snippet
videoId={id}
maxResults=100
order={sortOrder} (Dynamic: relevance or time)

```

- Single API call
- No pagination in V1

---

## User Interaction Flow

1. User opens **Comment Explorer**
2. User pastes a YouTube video URL
3. App fetches up to 100 top-level comments
4. Emoji-only comments are removed
5. Remaining comments are categorised client-side
6. User browses comments by category or views all comments
7. User copies individual comments or exports entire categories
8. User downloads comments via a **single Download button**, choosing CSV or Excel format

No data is stored.

---

## Comment Processing Logic (V1)

### Step 1: Comment Cleaning

- Remove comments that contain **only emojis**
- Preserve comments containing text + emojis

---

### Step 2: Intent Classification (Rule-Based)

Each comment is assigned **one primary category**.

### Categories

| Category | Detection Signals |
| --- | --- |
| ❓ Questions | `?`, “how”, “why”, “what”, “can you” |
| 📣 Requests | “please”, “make a video”, “do a video on”, “cover” |
| 😕 Confusion | “don’t understand”, “confusing”, “lost” |
| ⚖️ Comparisons | “vs”, “better than”, “difference between” |
| 👍 Feedback | Praise / reactions |
| 📂 Other | Uncategorized |

> Note: Some questions may appear outside the Questions category.
> 

---

### Step 3: Sorting & Signal Density

### Default Sorting

- YouTube relevance (API order)

### Feedback Category Enhancements

- Sorted by **comment length × likes**
- Very short comments visually de-emphasised (not removed)

This keeps signal density high without hiding data.

---

## UI Structure

---

### 1️⃣ Input Section

- YouTube video URL input
- **Sort Option:** Toggle between **"Top Comments"** (Relevance) and **"Newest First"** (Time).
- **Analyse Comments** button
- Helper text:

> Works with any language. Classification accuracy may vary.
> 

---

### 2️⃣ Category Tabs

Tabs include:

- ❓ Questions
- 📣 Requests
- 😕 Confusion
- ⚖️ Comparisons
- 👍 Feedback
- 📂 Other
- 📋 All Comments

Each tab shows:

- Comment count
- Scrollable list

---

### 3️⃣ Comment Cards

Each comment displays:

- Original comment text
- Like count
- Reply count (if available)
- **Copy** button

No rewriting or summarisation.

---

### 4️⃣ Export / Copy / Download Controls

Controls are available **everywhere copy options exist**.

---

### Per Comment

- **Copy** button
    - Copies the single comment as plain text
    - Preserves original wording

(No download option at single-comment level.)

---

### Per Category (including “All Comments”)

Buttons:

- **Copy All**
- **Download**

---

### Download Button Behaviour

- A single **Download** button per category
- On click, a **format selection menu** is shown

Format options:

- **Download as CSV**
- **Download as Excel (.xlsx)**

The selected format is downloaded immediately.

---

### Export Rules (Applies to Both Formats)

- Only comments visible in the active category are exported
- One comment per row
- Preserves original comment text (no rewriting)
- To prevent CSV/Excel injection, any cell value starting with: =, +, -, or @ will be prefixed with a single quote (').
- Includes metadata columns:
    - Comment text
    - Like count
    - Reply count
    - Category

---

### CSV Format

- UTF-8 encoded
- Compatible with:
    - Excel
    - Google Sheets
    - Notion

---

### Excel (.xlsx) Format

- Single worksheet per download
- Preserves line breaks in comments
- Designed for filtering, sorting, and further analysis

---

### Copy All (Unchanged)

- Copies comments as plain text
- One comment per line
- Preserves original wording

Example output:

```
- How do I set OBS on a low end PC?
- OBS settings for weak laptops?
- Can you make a video about this?

```

---

### UX Notes

- Download format selector may be implemented as:
    - Dropdown
    - Popover ?
    - Bottom sheet (mobile) ?
- No automatic downloads without explicit format selection
- Button labels remain consistent across categories
- Must display "Data provided by YouTube" with the standard YouTube logo to comply with API Terms of Service.

---

## Handling Large Comment Volumes

- Only top 100 comments (by relevance) are analysed
- UI message:

> Showing the most relevant audience comments.
> 

---

## Empty & Error States

### No Public Comments

- Triggered when the video has no public comments available
- Non-blocking informational state

> “This video has no public comments.”
> 

---

### No Comments in Category

- Triggered when filters or categories return zero results
- Non-blocking informational state

> “No comments found in this category.”
> 

---

### Comments Disabled

- Triggered when the video owner has disabled comments
- Block comment retrieval

> “Comments are disabled for this video.”
> 

---

### Invalid YouTube URL

- Triggered when URL is malformed or not a valid YouTube video link
- Block comment retrieval

> “Please enter a valid YouTube video URL.”
> 

---

### YouTube API Quota Exceeded

- Triggered when API request limits are reached
- Temporary blocking state

> “YouTube data limit reached. Please try again later.”
> 

---

### CSV / Excel Export Failure

- Triggered when comment data cannot be exported
- Comments remain visible in UI

> “Unable to generate the export file. Please try downloading again.”
> 

---

### Generic API Error

- Catch-all for unexpected failures during comment retrieval
- Fallback state

> “Unable to fetch comments at this time.”
> 

---

## Authentication & Access

- Requires signed-in user
- Rate Limit: 20 requests per day per user.
- No comment content stored

---

## Dependencies

### Backend

- YouTube Data API v3

### Client-side

- Regex / keyword matching
- Simple sorting heuristics
- Client-side CSV & XLSX generation
- No AI / no NLP libraries

---

## 4. User Flows & Application Architecture

### 4.1 Full App User Journey (Dashboard-Level)

```
@startuml
User -> Landing Page: Visit website
Landing Page -> Auth: Sign up / Login (Google or Email)
Auth -> User: Authenticated session
User -> Dashboard: Redirect after login
Dashboard -> User: Home page
User -> Sidebar: Select tool
Sidebar -> Tool Route: Load selected tool
Tool Route -> User: Tool UI in main panel
User -> Sidebar: Switch tools
User -> Profile Menu: Open user menu
Profile Menu -> Settings: View settings
Profile Menu -> Auth: Logout
@enduml

```

---

### 4.2 Sidebar Navigation Model

```
@startuml
Sidebar -> Home
Sidebar -> Analyze Video Data
Sidebar -> Extract Comments
Sidebar -> Compress Thumbnail
Sidebar -> Generate QR Code
Sidebar -> Coming Soon Tools
Sidebar -> Request Tool (future)
Sidebar -> Settings
Sidebar -> Logout
@enduml

```

---

### 4.3 Feature-Specific User Flows

### Global Flow (All Tools)

```
@startuml
User -> App: Visit app
App -> User: Show sign-in gate
User -> App: Sign in with Google or Email
App -> User: Tool selection screen
User -> App: Select tool
App -> User: Tool-specific flow
@enduml

```

---

### Feature 1: QR Code Generator Flow

```
@startuml
User -> QR Tool: Paste URL
QR Tool -> QR Tool: Validate URL
QR Tool -> QR Tool: Generate QR (client-side)
User -> QR Tool: Customize styles
QR Tool -> User: Live preview
User -> QR Tool: Select size & format
QR Tool -> User: Download file
@enduml

```

---

### Feature 2: Thumbnail Compressor Flow

```
@startuml
User -> Thumbnail Tool: Upload image
Thumbnail Tool -> Thumbnail Tool: Resize to optimal YouTube resolution
Thumbnail Tool -> Thumbnail Tool: Compress adaptively
Thumbnail Tool -> User: Show before/after preview
User -> Thumbnail Tool: Download thumbnail
@enduml

```

---

### Feature 3: Metadata Inspector Flow

```
@startuml
User -> Metadata Tool: Paste YouTube URL
Metadata Tool -> Metadata Tool: Extract video ID
Metadata Tool -> YouTube API: videos.list
YouTube API -> Metadata Tool: Metadata response
Metadata Tool -> User: Display grouped metadata
User -> Metadata Tool: Copy fields
@enduml

```

---

### Feature 4: Comment Explorer Flow

```
@startuml
User -> Comment Explorer: Paste YouTube URL
Comment Explorer -> YouTube API: commentThreads.list
YouTube API -> Comment Explorer: Comments
Comment Explorer -> Comment Explorer: Clean & categorize
Comment Explorer -> User: Display categories
User -> Comment Explorer: Copy or Download
Comment Explorer -> User: CSV or Excel file
@enduml

```

---

## 5. Technical Stack

### Frontend

- **Next.js (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (component system)

### Authentication & Email

- **Auth.js**
    - Google OAuth
    - Email magic-link authentication
- **Resend** (transactional auth emails)

### Backend / Data

- **MongoDB**
    - **Auth:** Stores standard user sessions (Auth.js).
    - **Usage Tracking**: Applied only to YouTube API–based tools.
    - **Schema Structure:**
        - _id
        - email
        - authProvider(s): [google, email]
        - 
        - usage:
            - metadataInspector:
            - count: number
            - lastResetDate: Date
            - commentExplorer:
            - count: number
            - lastResetDate: Date
        - createdAt
        - updatedAt

### APIs & External Services

- All YouTube API requests are executed server-side.
- API keys are never exposed to the client.
- **YouTube Data API v3**
    - videos.list
    - commentThreads.list

### Client-Side Libraries (Feature-Specific)

- `qr-code-styling` (QR generation)
- `browser-image-compression` (image optimization)

---

## 6. Error Handling & Security

This section defines **global error handling, session management, rate limiting, and security requirements** that apply across the entire application and all tools.

---

### 6.1 Error Handling Principles

- Errors must be:
    - Clear and human-readable
    - Actionable (tell the user what to do next)
    - Non-technical (no stack traces, API names, or codes)
- Errors should never crash the app or break navigation
- Tool-level errors must be isolated and must not affect other tools or the user session

---

### 6.2 Authentication & Session Errors

Users may authenticate using:

- Google OAuth
- Email-based magic link (passwordless)

No passwords are stored or managed by the application.

### Sign Up / Sign In

Handled error cases include:

- Invalid email address
- Expired or already-used magic link
- Google OAuth cancelled or failed
- Email delivery failure
- Generic Sign-In Failure

### User-Facing Messages

**Invalid Email Address**

- Triggered when email format is invalid

> “Please enter a valid email address.”
> 

---

**Expired or Used Magic Link**

- Triggered when link is no longer valid

> “This sign-in link has expired or already been used. Please request a new one.”
> 

---

**Google OAuth Cancelled**

- Triggered when user closes or cancels OAuth flow
- Non-blocking

> “Sign-in was cancelled.”
> 

---

**Google OAuth Failed**

- Triggered by OAuth provider error or timeout

> “Google sign-in failed. Please try again.”
> 

---

**Email Delivery Failure**

- Magic links are single-use, time-limited, and valid only for sign-in.
- Triggered when magic link email cannot be sent

> “We couldn’t send the sign-in email. Please try again later.”
> 

---

**Generic Sign-In Failure**

- Catch-all for unexpected authentication errors

> “Unable to sign in. Please try again.”
> 

---

### Rate Limiting (Authentication)

- Sign-in and magic-link requests are rate-limited per user/email
- After limit is reached, requests are temporarily blocked

**User-Facing Message**

> “Too many sign-in attempts. Please try again in a few minutes.”
> 

---

### 6.3 Session Management & Cookies

- Authenticated sessions are stored using secure cookies
- Sessions persist across page reloads and browser restarts
- Session ends when:
    - User logs out
    - Cookies are cleared by the user
    - Session expires server-side

Handled states:

- Expired session → redirect to login with message
- Invalid session → silent redirect to login

---

### 6.4 Rate Limiting (App-Wide)

- Per-user daily limits apply to YouTube API-based tools only
- Client-side tools (QR Generator, Thumbnail Compressor):
    - Do not use the YouTube API
    - Are not subject to daily limits
    - Do not generate usage counters or stored metrics
    - Soft UI throttling may be applied to prevent accidental or abusive rapid actions.
- Counters reset automatically at **00:00 UTC** (or upon the first request of a new day).
- Limits are clearly communicated in the UI

User message:

> “Daily usage limit reached. Please try again tomorrow.”
> 

---

### 6.5 Security & Privacy Requirements

- HTTPS is enforced across the entire application.
- Secure, HTTP-only cookies are used for authentication.
- CSRF and XSS protections are enabled at the framework and middleware levels.
- External API credentials are stored securely server-side and are never shipped to the browser or exposed to the client.
- Client-side tools do not emit analytics, counters, or usage events beyond standard page-view metrics.
- No storage of the following data occurs at any time:
    - URLs
    - Images
    - Comments
    - Generated files
- All processing of URLs, images, and comments occurs strictly in memory and is discarded immediately after the user action completes.
- Strict `Referrer-Policy` headers are enforced to prevent URL or source leakage.

### URL Validation & Sanitization

- All user-provided URLs are validated prior to processing.
- Only the following URL schemes are permitted:
    - `https://`
    - `http://` (optional)
- The following URL schemes are explicitly rejected:
    - `javascript:`
    - `data:`
    - `file:`
    - `blob:`
- URLs that fail validation are rejected with a clear, user-facing error message.

### Data Export Safety

- Exported CSV and XLSX files are protected against formula injection.
- Any cell value beginning with `=`, `+`, , or `@` is prefixed with a single quote (`'`) prior to export.

### Session Integrity

- User sessions are invalidated on re-authentication.
- Concurrent or stale session conflicts are handled gracefully to prevent session fixation or cross-tab authentication errors.
- Abuse-prevention mechanisms (e.g., throttling or IP-based controls) may be introduced without impacting user-facing functionality.

Only authentication-related user data is persisted.

---

### 6.6 Edge Case Handling

### Session & Runtime Interruption Errors

### Page Refresh During Active Request

- Triggered when the page is refreshed while a request is in progress
- In-flight operation is cancelled safely

> “Your action was interrupted by a page refresh. Please try again.”
> 

---

### Tool Switch Mid-Request

- Triggered when user navigates to another tool while processing is active
- Request is aborted to prevent conflicts

> “The previous task was stopped when you switched tools.”
> 

---

### Multiple Tabs Open

- Triggered when the same session is active in multiple browser tabs
- State may become out of sync

> “This session is open in another tab. Please continue in one tab to avoid conflicts.”
> 

---

### Temporary Loss of Internet Connection

- Triggered by network disconnect or request timeout
- Auto-retry possible when connection is restored

> “Connection lost. Please check your internet connection and try again.”
> 

---

### Cookies / Session Data Cleared

- Triggered when cookies or local storage are cleared mid-session
- User context is lost

> “Your session has ended. Please refresh the page and sign in again.”
> 

---

### Generic Session Interruption

- Catch-all for unexpected runtime interruptions
- Ensures graceful failure without data corruption

> “Something interrupted the session. Please try again.”
> 

---

### Expected Behaviour (All Cases)

- Graceful failure without partial or corrupted data
- Clear, actionable recovery messaging
- Safe cancellation of in-flight requests

---

### **6.7 Compliance & Branding**

- **YouTube API Compliance:**
    - All API-driven tools must display the text "Powered by YouTube" or the YouTube logo in the tool footer.
    - Privacy Policy must explicitly state that the client uses YouTube API Services.
    - The application does not modify, cache, or rehost YouTube content beyond transient API responses required for display.

---

## 7. Non-Goals (Explicit)

- No AI-generated insights
- No analytics dashboards
- No user data exports beyond explicit downloads
- No background jobs or queues
- No server-side image processing

---

## 8. Summary

This PRD defines a **focused, high-utility creator toolset** built around transparency, speed, and ownership of data. The product intentionally avoids AI interpretation and long-term storage, positioning itself as a trusted utility rather than a black-box platform.