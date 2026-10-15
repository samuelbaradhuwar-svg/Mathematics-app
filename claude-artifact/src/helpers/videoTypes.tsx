export interface VideoDto {
  id: string;
  title: string;
  channel: string;
  duration: string; // "9:41"
  durationSeconds: number;
  thumbnail: string;
  url: string;
  why: string; // short, honest explanation of why it was picked
}

export interface SearchLink {
  label: string;
  url: string;
}

export type VideoSearchResult = {
  // "youtube-api": real results from the YouTube Data API.
  // "search-links": no API key is connected (or the API is unavailable): we only offer YouTube search links.
  mode: "youtube-api" | "search-links";
  query: string;
  videos: VideoDto[];
  searchLinks: SearchLink[];
  cached: boolean;
  note?: string;
};
