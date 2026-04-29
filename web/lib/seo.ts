export const SITE_NAME = "IRCTC Connect";
export const SITE_TITLE =
  "IRCTC Connect - Indian Railways API for PNR Status, Live Train Tracking & Seat Availability";
export const SITE_DESCRIPTION =
  "IRCTC Connect is a developer-focused Indian Railways API and Node.js SDK for PNR status, live train tracking, station boards, train search, and seat availability.";
export const SITE_KEYWORDS = [
  "irctc connect",
  "irctc api",
  "irctc sdk",
  "indian railways api",
  "indian railways sdk",
  "node.js irctc package",
  "irctc npm package",
  "pnr status api",
  "train tracking api",
  "live train tracking api",
  "seat availability api",
  "train search api",
  "railway station live status",
  "railway api for developers",
  "irctc package for nodejs",
];
export const SOCIAL_IMAGE_PATH = "/icon.png";
export const OG_LOCALE = "en_IN";
export const TWITTER_CARD = "summary_large_image";
export const TWITTER_HANDLE = "@rajiv81205";

export function getSiteUrl(): string {
  const raw = "https://irctc.rajivdubey.tech";
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
          width: 512,
          height: 512,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: TWITTER_CARD,
      title: resolvedTitle,
      description,
      creator: TWITTER_HANDLE,
      images: [absoluteUrl(SOCIAL_IMAGE_PATH)],
    },
  };
}
