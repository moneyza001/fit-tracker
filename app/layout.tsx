import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { SessionProvider } from "@/components/providers/session-provider";
import { auth } from "@/auth";
import "./globals.css";

const ACCENT_BOOTSTRAP_SCRIPT = `try {
  var accent = localStorage.getItem("fittracker:accent");
  if (accent) document.documentElement.setAttribute("data-accent", accent);
} catch (e) {}`;

const roboto = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FitTracker",
  description: "Fitness tracking app — programs, workouts, and progress analytics",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable}`}
    >
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: ACCENT_BOOTSTRAP_SCRIPT }} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            {children}
            <Toaster />
            <ServiceWorkerRegister />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
