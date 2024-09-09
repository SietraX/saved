"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gray-100 shadow-md">
      <Link href="/" className="text-xl font-bold">
        SAVED
      </Link>
      <div className="flex items-center space-x-4">
        <Link href="/billing">
          <Button variant="ghost">Billing</Button>
        </Link>
        {status === "authenticated" ? (
          <>
            <Link href="/saved-collections">
              <Button variant="ghost">Saved Collections</Button>
            </Link>
            <Link
              href="/playlists"
              className={pathname.startsWith("/playlists") || pathname.startsWith("/liked-videos") || pathname.startsWith("/watch-later") ? "font-bold" : ""}
            >
              YT Collections
            </Link>
            <Button onClick={() => signOut({ callbackUrl: "/" })} variant="outline">
              Logout
            </Button>
          </>
        ) : (
          <Button onClick={() => signIn("google", { callbackUrl: "/playlists" })} variant="outline">
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};
