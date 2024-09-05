"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const WelcomeScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Collections</h1>
      <p className="text-xl mb-8">
        Manage your playlists, liked videos, and more!
      </p>
      <Button onClick={() => signIn("google", { callbackUrl: "/collections" })}>
        Sign in with Google
      </Button>
    </div>
  );
};
