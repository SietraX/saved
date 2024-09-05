import { getAuthProviders } from "./providers";
import { SignInClient } from "./sign-in-client";

export default async function SignIn() {
  const providers = await getAuthProviders();

  return <SignInClient providers={providers} />;
}
