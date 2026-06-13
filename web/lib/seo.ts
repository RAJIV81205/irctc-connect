export const SITE_NAME = "IRCTC Connect";
export const SITE_TITLE =
  "IRCTC Connect - Indian Railways API for PNR Status, Live Train Tracking & Seat Availability";
export const SITE_DESCRIPTION =
  "IRCTC Connect is a developer-focused Indian Railways API and Node.js SDK for PNR status, live train tracking, station boards, train search, and seat availability.";
export const SITE_KEYWORDS = [
  "irctc",
  "irctc connect",
  "irctc api",
  "irctc sdk",
  "indian railways api",
  "railway api",
  "train data api",
  "train history api",
  "fare lookup api",
  "train availability api",
  "indian railways sdk",
  "node.js irctc package",
  "irctc npm package",
  "pnr status api",
  "pnr status check api",
  "train tracking api",
  "live train tracking api",
  "seat availability api",
  "train search api",
  "railway station live status",
  "railway api for developers",
  "irctc package for nodejs",
  "train between stations api",
  "check pnr status",
  "irctc api key",
  "indian railways rest api",
  "train running status api",
  "irctc developer api",
  "irctc integration nodejs",
  "railway data api india",
  "train availability checker api",
  "irctc connect npm",
];
export const SOCIAL_IMAGE_PATH = "/icon.png";
export const OG_LOCALE = "en_IN";
export const TWITTER_CARD = "summary_large_image";
export const TWITTER_HANDLE = "@rajiv81205";
export const TWITTER_SITE = "@rajiv81205";
// Ideal OG image: 1200×630px. Current icon.png is 512×512 (acceptable fallback).
export const OG_IMAGE_WIDTH = 512;
export const OG_IMAGE_HEIGHT = 512;

export function getSiteUrl(): string {
  const raw = "https://irctc.rajivdubey.dev";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "/",
}: {
  title?: string;
  description?: string;
  path?: string;
}) {
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;

  return {
    title: resolvedTitle,
    description,
    keywords: SITE_KEYWORDS,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: OG_LOCALE,
      type: "website" as const,
      images: [
        {
          url: absoluteUrl(SOCIAL_IMAGE_PATH),
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: TWITTER_CARD,
      title: resolvedTitle,
      description,
      site: TWITTER_SITE,
      creator: TWITTER_HANDLE,
      images: [absoluteUrl(SOCIAL_IMAGE_PATH)],
    },
  };
}
