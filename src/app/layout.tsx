import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import InstallBanner from "@/components/InstallBanner";
import RegisterSW from "@/components/RegisterSW";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "GoalCast — World Cup 2026 Predictions",
  description:
    "Predict every World Cup match. Beat the AI. Top your country. A FIFA World Cup 2026 predictions game.",
  manifest: "/manifest.json",
  applicationName: "GoalCast",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GoalCast",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "GoalCast — World Cup 2026 Predictions",
    description: "Predict every World Cup match. Beat the AI. Top your country.",
    url: appUrl,
    siteName: "GoalCast",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050807",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <Providers>
          <div className="app-shell">
            {children}
            <InstallBanner />
          </div>
          <RegisterSW />
        </Providers>
      </body>
    </html>
  );
}
