// Single access point for curriculum data. Adding Grade 9 later means adding a
// curriculumGrade9 data file and registering it here: no UI changes needed.
import type { GradeCurriculum, Subtopic, Topic } from "./curriculumTypes";
import { curriculumGrade8 } from "./curriculumGrade8";

const CURRICULA: Record<number, GradeCurriculum> = {
  8: curriculumGrade8,
};

export interface SubtopicRef {
  topic: Topic;
  subtopic: Subtopic;
  indexInTopic: number;
}

const cache = new Map<number, Map<string, SubtopicRef>>();

const subtopicIndex = (grade: number): Map<string, SubtopicRef> => {
  let idx = cache.get(grade);
  if (!idx) {
    idx = new Map();
    const c = CURRICULA[grade];
    if (c) {
      for (const topic of c.topics) {
        topic.subtopics.forEach((subtopic, indexInTopic) => {
          idx!.set(subtopic.id, { topic, subtopic, indexInTopic });
        });
      }
    }
    cache.set(grade, idx);
  }
  return idx;
};

export const curriculumRegistry = {
  supportedGrades: (): number[] => Object.keys(CURRICULA).map(Number).sort((a, b) => a - b),
  get: (grade: number): GradeCurriculum | undefined => CURRICULA[grade],
  topics: (grade: number): Topic[] => CURRICULA[grade]?.topics ?? [],
  topic: (grade: number, topicId: string): Topic | undefined =>
    CURRICULA[grade]?.topics.find((t) => t.id === topicId),
  subtopic: (grade: number, subtopicId: string): SubtopicRef | undefined =>
    subtopicIndex(grade).get(subtopicId),
  allSubtopics: (grade: number): SubtopicRef[] => Array.from(subtopicIndex(grade).values()),
  // Next subtopic in the topic, if any
  nextInTopic: (grade: number, subtopicId: string): Subtopic | undefined => {
    const ref = subtopicIndex(grade).get(subtopicId);
    return ref ? ref.topic.subtopics[ref.indexInTopic + 1] : undefined;
  },
};