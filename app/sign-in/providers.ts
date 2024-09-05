import { getProviders } from "next-auth/react";

export async function getAuthProviders() {
  return await getProviders();
}
