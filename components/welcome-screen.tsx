"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const WelcomeScreen = () => {
  const { status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Collections</h1>
      <p className="text-xl mb-8">
        Manage your playlists, liked videos, and more!
      </p>
      {status === "unauthenticated" ? (
        <Button onClick={() => signIn("google", { callbackUrl: "/saved-collections" })}>
          Sign in with Google
        </Button>
      ) : status === "authenticated" ? (
        <Link href="/saved-collections">
          <Button>Go to Collections</Button>
        </Link>
      ) : null}
    </div>
  );
};
