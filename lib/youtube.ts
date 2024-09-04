import { google } from 'googleapis';
import { getSession } from "next-auth/react";

export const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY || undefined
});

export const getAuthenticatedYoutube = async () => {
  const session = await getSession();
  if (!session?.accessToken) {
    throw new Error("No access token found");
  }
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken as string });
  
  // Set up a listener for token refresh
  auth.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // TODO: Implement logic to save the new refresh token
    }
  });

  return google.youtube({ version: 'v3', auth });
};