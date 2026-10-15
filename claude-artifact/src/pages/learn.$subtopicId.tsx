import React from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { LessonPlayer } from "../components/LessonPlayer";

const LearnPage: React.FC = () => {
  const { subtopicId = "" } = useParams();
  return (
    <>
      <Helmet>
        <title>Lesson · My Maths Tutor</title>
      </Helmet>
      <LessonPlayer key={subtopicId} subtopicId={subtopicId} />
    </>
  );
};

export default LearnPage;
