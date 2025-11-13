import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider as NextThemesProvider } from "@/components/theme-provider";
import { ThemeProvider } from "@/hooks/use-theme-context";
import { auth } from "@/src/lib/auth";
import { getDefaultTheme, getUserActiveTheme } from "@/app/(app)/settings/_lib/theme-actions";
import { generateCompleteThemeCSS } from "@/lib/theme-utils";
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
  title: "Sprite.exe - Learn to Code with AI",
  description: "Interactive coding education platform with personalized AI assistant",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load user session to get userId
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  // Load user's theme (unified format with both light/dark variants)
  // For SSR, we generate CSS for both modes from the same theme object
  const theme = userId ? await getUserActiveTheme(userId) : await getDefaultTheme();

  // Generate CSS for both light and dark variants from unified theme
  // This prevents FOUC (Flash of Unstyled Content) on page load
  // generateCompleteThemeCSS extracts *_light and *_dark colors from the theme
  const themeCSS = generateCompleteThemeCSS(theme);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme-id={theme.slug}
    >
      <head>
        {/* Inject theme CSS variables for both light and dark modes */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* next-themes provider for light/dark mode toggle */}
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Custom ThemeProvider for theme selection and instant updates */}
          <ThemeProvider
            initialTheme={theme}
            initialDarkTheme={theme}
          >
            {children}
          </ThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
