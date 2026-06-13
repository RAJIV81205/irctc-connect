export const SITE_NAME = "IRCTC Connect";
export const SITE_TITLE =
  "IRCTC Connect - Indian Railways API & Node.js SDK for PNR Status, Live Train Tracking & Seat Availability";
export const SITE_DESCRIPTION =
  "IRCTC Connect is a developer-first Indian Railways REST API and Node.js SDK. Check PNR status, track live trains, search trains between stations, view seat availability, fare, and station boards in real time.";

// Primary brand + product keywords (high-intent, brand-defining).
export const PRIMARY_KEYWORDS = [
  "irctc",
  "irctc connect",
  "irctc api",
  "irctc sdk",
  "irctc developer",
  "indian railways api",
  "railway api",
  "indian railways sdk",
  "irctc nodejs",
  "irctc npm",
  "irctc npm package",
  "irctc connect npm",
  "irctc package for nodejs",
  "irctc integration nodejs",
  "node.js irctc package",
  "indian railways rest api",
  "irctc rest api",
  "irctc api key",
  "irctc api for developers",
  "irctc api documentation",
  "railway api for developers",
  "railway data api india",
  "indian railways data api",
  "irctc javascript sdk",
  "irctc typescript sdk",
  "irctc api pricing",
];

// Feature-specific keywords mapped to actual endpoints in the SDK.
export const FEATURE_KEYWORDS = [
  "pnr status api",
  "pnr status check api",
  "check pnr status",
  "pnr enquiry api",
  "pnr prediction api",
  "train tracking api",
  "live train tracking api",
  "live train running status",
  "train running status api",
  "train schedule api",
  "train time table api",
  "train between stations api",
  "train search api",
  "seat availability api",
  "train availability checker api",
  "train fare api",
  "train fare enquiry api",
  "station board api",
  "live station board",
  "train route api",
  "train coach position",
  "platform number api",
  "tatkal api",
  "train reservation status api",
  "indian railway passenger status",
  "railway station live status",
];

// Discovery / how-to terms real developers search.
export const DISCOVERY_KEYWORDS = [
  "how to check pnr status",
  "how to track train live",
  "train running status today",
  "irctc pnr status check",
  "indian railways pnr status",
  "indian railways live train status",
  "pnr status check online",
  "live train status indian railways",
  "train between two stations",
  "indian railways api free",
  "irctc api free tier",
  "best irctc api",
  "indian railway api nodejs",
  "npm install irctc",
  "irctc npm install",
  "irctc api integration",
  "indian railway timetable api",
  "railway api node js",
  "railway data api node",
  "irctc train schedule",
  "indian railways seat availability",
  "irctc seat availability check",
  "indian railway fare calculator api",
  "indian railway station code api",
  "irctc developer portal",
  "railway api sandbox",
  "indian railway api for website",
];

// Single source of truth used by root metadata and per-page helpers.
export const SITE_KEYWORDS = [
  ...PRIMARY_KEYWORDS,
  ...FEATURE_KEYWORDS,
  ...DISCOVERY_KEYWORDS,
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

export type BuildMetadataOptions = {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  imagePath?: string;
};

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  keywords,
  path = "/",
  imagePath = SOCIAL_IMAGE_PATH,
}: BuildMetadataOptions = {}) {
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  const resolvedKeywords = keywords?.length ? keywords : SITE_KEYWORDS;
  const imageUrl = absoluteUrl(imagePath);

  return {
    title: resolvedTitle,
    description,
    keywords: resolvedKeywords,
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
          url: imageUrl,
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
      images: [imageUrl],
    },
  };
}
