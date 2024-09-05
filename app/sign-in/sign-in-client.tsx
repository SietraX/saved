"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface Provider {
  id: string;
  name: string;
}

interface SignInClientProps {
  providers: Record<string, Provider> | null;
}

export function SignInClient({ providers }: SignInClientProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Sign In</h1>
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.name}>
            <Button onClick={() => signIn(provider.id, { callbackUrl: "/collections" })}>
              Sign in with {provider.name}
            </Button>
          </div>
        ))}
    </div>
  );
}
