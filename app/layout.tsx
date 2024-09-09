import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navigation />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
