// Maps a question generator key to the curriculum subtopic/topic it belongs to.
import { curriculumRegistry } from "./curriculumRegistry";

export interface QuestionHome {
  topicId: string;
  subtopicId: string;
  isFoundation: boolean;
}

export const questionHome = (grade: number, generatorKey: string): QuestionHome => {
  const ref = curriculumRegistry.allSubtopics(grade).find((r) => r.subtopic.generator === generatorKey);
  if (ref) return { topicId: ref.topic.id, subtopicId: ref.subtopic.id, isFoundation: false };
  return { topicId: "foundation", subtopicId: generatorKey, isFoundation: true };
};