"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

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
        {status === "authenticated" ? (
          <>
            <Link href="/saved-collections">
              <Button variant="ghost">Saved Collections</Button>
            </Link>
            <Link
              href="/playlists"
              className={(pathname ?? "").startsWith("/playlists") || (pathname ?? "").startsWith("/liked-videos") || (pathname ?? "").startsWith("/watch-later") ? "font-bold" : ""}
            >
              YT Collections
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-10 h-10 rounded-full p-0">
                  <Image
                    src={session.user?.image || "/default-avatar.png"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button onClick={() => signIn("google", { callbackUrl: "/" })} variant="outline">
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};
