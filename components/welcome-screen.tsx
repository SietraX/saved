"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

export const WelcomeScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Collections</h1>
      <p className="text-xl mb-8">
        Manage your playlists, liked videos, and more!
      </p>
    </div>
  );
};
