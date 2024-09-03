import { google } from 'googleapis';

export const youtube = google.youtube({
  version: 'v3',
  auth: process.env.GOOGLE_API_KEY || undefined
});

export const getAuthenticatedYoutube = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.youtube({ version: 'v3', auth });
};