/**
 * Root layout. Wraps every page with the fonts, the dark theme, and the
 * client-side session provider.
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Model Bench — Compare AI Models Side by Side",
  description:
    "Compare AI models side by side, powered by OpenRouter. Test GPT, Claude, Llama, Gemini, DeepSeek, and more in a single prompt.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {/* Makes useSession() available to client components (playground). */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
