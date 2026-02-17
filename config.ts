import { ConfigProps } from "./types/config";
import "./libs/env"; // MED-01 Fix: Run env validation on import

// DaisyUI v5 no longer exports themes directly, using fallback color
const themes = {
  light: {
    primary: "#0A68F5",
  }
};

export const toolsConfig = [
  {
    id: "comments",
    name: "extract comments",
    href: "/tools/comments",
    status: "active"
  },
  {
    id: "thumbnail",
    name: "compress thumbnail",
    href: "/tools/thumbnail",
    status: "active"
  },
  {
    id: "metadata",
    name: "analyze video data",
    href: "/tools/metadata",
    status: "coming-soon"
  },
  {
    id: "qr",
    name: "generate qr code",
    href: "/tools/qr",
    status: "coming-soon"
  },
];

const config = {
  // REQUIRED
  appName: "Youtube OS Studio",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "A creator utility suite containing high-utility tools for YouTube creators. QR Code Generator, Thumbnail Compressor, Metadata Inspector, and more.",
  // REQUIRED (no https://, not trailing slash at the end, just the naked domain)
  domainName: "os.youtube.studio",
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `YoutubeOS <noreply@email.nullab.io>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Admin at YoutubeOS <admin@email.nullab.io>`,
    // Email shown to customer if they need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@email.nullab.io",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you use any theme other than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/",
    // REQUIRED — the path you want to redirect users to after a successful login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;

