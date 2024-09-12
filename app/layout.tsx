import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/components/supabase-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <Providers>
            <Navigation />
            {children}
          </Providers>
          <Toaster />
        </SupabaseProvider>
      </body>
    </html>
  );
}
