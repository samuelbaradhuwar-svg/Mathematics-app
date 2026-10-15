import type { Recommendation } from "./mastery";

export const recommendationLink = (rec: Recommendation): string => {
  if (!rec.subtopicId) return "/lessons";
  if (rec.action === "lesson") return `/learn/${rec.subtopicId}`;
  if (rec.action === "video") return `/videos?subtopic=${rec.subtopicId}`;
  return `/practice/${rec.subtopicId}`;
};

export const recommendationVerb = (rec: Recommendation): string => {
  if (rec.action === "lesson") return rec.kind === "fix-gap" ? "Let's go over it" : "Start the lesson";
  if (rec.action === "video") return "Watch a video";
  return rec.kind === "revise" ? "Quick revision" : "Practise now";
};