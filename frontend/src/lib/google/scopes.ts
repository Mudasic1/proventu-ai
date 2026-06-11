export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events";
export const GOOGLE_GMAIL_SEND_SCOPE =
  "https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_CRM_SCOPES = [
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_GMAIL_SEND_SCOPE,
] as const;
