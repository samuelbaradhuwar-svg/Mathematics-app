import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import { store } from "./store";
import { AppShell } from "../src/components/AppShell";
import { LearnerGate } from "../src/components/LearnerGate";
import { ParentShell } from "../src/components/ParentShell";
import Home from "../src/pages/_index";
import Baseline from "../src/pages/baseline";
import Learn from "../src/pages/learn.$subtopicId";
import TopicPage from "../src/pages/lessons.$topicId";
import Lessons from "../src/pages/lessons";
import Parent from "../src/pages/parent";
import PracticeSession from "../src/pages/practice.$subtopicId";
import Practice from "../src/pages/practice";
import Progress from "../src/pages/progress";
import Scan from "../src/pages/scan";
import Tutor from "../src/pages/tutor";
import Videos from "../src/pages/videos";
import Welcome from "../src/pages/welcome";

const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } } });

const learner = (el: React.ReactNode) => (
  <LearnerGate>
    <AppShell>{el}</AppShell>
  </LearnerGate>
);

const App: React.FC = () => (
  <QueryClientProvider client={client}>
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={learner(<Home />)} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/lessons" element={learner(<Lessons />)} />
        <Route path="/lessons/:topicId" element={learner(<TopicPage />)} />
        <Route path="/learn/:subtopicId" element={learner(<Learn />)} />
        <Route path="/practice" element={learner(<Practice />)} />
        <Route path="/practice/:subtopicId" element={learner(<PracticeSession />)} />
        <Route path="/tutor" element={learner(<Tutor />)} />
        <Route path="/scan" element={learner(<Scan />)} />
        <Route path="/progress" element={learner(<Progress />)} />
        <Route path="/videos" element={learner(<Videos />)} />
        <Route path="/baseline" element={learner(<Baseline />)} />
        <Route
          path="/parent"
          element={
            <LearnerGate>
              <ParentShell>
                <Parent />
              </ParentShell>
            </LearnerGate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

store.init().finally(() => {
  const root = document.getElementById("root")!;
  root.innerHTML = "";
  createRoot(root).render(<App />);
});
