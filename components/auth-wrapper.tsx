"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from "next-auth/react";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return null;
  }

  return <>{children}</>;
}

export default AuthWrapper;