"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100">
      <Link href="/" className="text-xl font-bold">
        SAVED
      </Link>
      <div className="flex items-center space-x-4">
        {status === "authenticated" ? (
          <>
            <Link
              href="/collections"
              className={pathname === "/collections" ? "font-bold" : ""}
            >
              Collections
            </Link>
            <Button onClick={() => signOut()} variant="outline">
              Logout
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              console.log("Login button clicked");
              signIn("google");
            }}
          >
            Login with Google
          </Button>
        )}
      </div>
    </nav>
  );
};
