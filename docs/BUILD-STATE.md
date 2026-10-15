# Build state: Judah's Personal AI Maths Tutor

Floot project id: `bd39e457-31ae-4b6d-bb79-dfecadb891a3`
Reference copies of earlier Floot files may be extracted from the session transcript; the live source of truth is Floot.

## Done and typechecked in Floot
Design (base.css), curriculum data (20 Grade 8 topics, generators, registry), mastery + baseline engines, AI/verification helpers,
all endpoints (learner, progress, baseline, practice, lesson, tutor, scan, videos, parent), and frontend:
MathText, MathVisual, Card, StatusPill, PageHeader, LearnerGate, AppShell, ProgressRing, TopicIcon, StepCard, TutorHelp,
QuestionRunner, pages login / welcome / _index, hooks useLearnerData / useTutorData, recommendationLink.

## Staged locally, NOT yet in Floot: `/home/user/Mathematics-app/floot-staging/`
Paths mirror the Floot project root; copy each file to the same path.
- components: QuestionSet, GuidedSolution, LessonPlayer, VideoList, TopicCard, ChatBubble, ScanExplanation, MiniBars, ParentShell (+ .module.css each)
- helpers: useVideoData, useBaselineData, useScanData, useParentData, resizeImage
- pages (+ .module.css + .pageLayout.tsx): lessons, lessons.$topicId, learn.$subtopicId, practice, practice.$subtopicId, tutor, scan, progress, videos, baseline, parent
- static/manifest.json

## To do after the daily build limit resets (09:00 UTC)
1. Push the staged files in a FEW large apply_patch batches (use write_file for files with multi-line raw strings). Budget ~10 actions.
2. Tidy-up: move `ScanServerData` from `endpoints/scan/explain_POST.ts` into `helpers/scanTypes.tsx`; fix the import in `endpoints/scan/practice_POST.ts`.
3. typecheck, fix errors, run_tests.
4. Link manifest in project metadata; set title/description/icon (update_project_metadata).
5. request_external_resource GENERIC `YOUTUBE_API_KEY` (app works without it: honest search links).
6. Ask the user to open the preview for visual checks (headless screenshots are not available).
7. QA smoke-test user `qa-smoke-test@example.invalid` exists: delete only after QA, tell the user.
8. create_checkpoint. Publish only if the user asks.
9. Write README + docs (architecture, CAPS sources, Floot notes, YouTube notes, mastery rules, limitations) into the repo. Do not commit/push unless asked.

## Final report must be honest about
- "FLOOR" interpreted as Floot (the hosting platform actually available).
- Official CAPS PDF unreachable from sandbox: term placement and scope recorded in each topic's `placement` field; verify against the official ATP.
- YouTube API key not connected: video list falls back to search links only.
- AI scan/tutor is calculator- or double-checked but not infallible. Latency about 6 s (chat), about 25 s (scan explain).
- Floot daily build limit (100/day) and Pro upgrade.
- Model: Claude Sonnet via Floot AI.
