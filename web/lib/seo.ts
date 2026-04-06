export const SITE_NAME = "IRCTC Connect";
export const SITE_TITLE = "IRCTC Connect - Indian Railways API & SDK";
export const SITE_DESCRIPTION =
  "IRCTC Connect is a developer-focused Indian Railways API and SDK for PNR status, live train tracking, station boards, train search, and seat availability.";
export const SITE_KEYWORDS = [
  "IRCTC API",
  "Indian Railways API",
  "PNR status API",
  "train tracking API",
  "IRCTC SDK",
  "railway station live status",
  "train availability API",
  "Node.js IRCTC package",
];
export const SOCIAL_IMAGE_PATH = "/icon.png";

export function getSiteUrl(): string {
  const raw = "https://irctc.rajivdubey.tech";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
