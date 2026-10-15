import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { useLearnerMe } from "../helpers/useLearnerData";
import { AuthLoadingState } from "./AuthLoadingState";
import { Skeleton } from "./Skeleton";
import styles from "./LearnerGate.module.css";

// Wrapper for every learner page: must be signed in AND have a learner profile.
export const LearnerGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const me = useLearnerMe();

  if (authState.type === "loading") return <AuthLoadingState title="Getting your lessons ready" />;
  if (authState.type === "unauthenticated") return <Navigate to="/login" replace />;

  if (me.isLoading) {
    return (
      <div className={styles.loading}>
        <Skeleton style={{ height: 56, width: "60%" }} />
        <Skeleton style={{ height: 160 }} />
        <Skeleton style={{ height: 160 }} />
      </div>
    );
  }
  if (me.isError) {
    return (
      <div className={styles.loading}>
        <p className={styles.error}>We couldn't load your profile. Please check your internet and refresh the page.</p>
      </div>
    );
  }
  if (!me.data?.learner) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};