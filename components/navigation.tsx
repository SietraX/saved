"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
        ) : null}
      </div>
    </nav>
  );
};
