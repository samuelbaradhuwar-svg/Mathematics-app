import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.type === "authenticated") navigate("/", { replace: true });
  }, [authState.type, navigate]);

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Sign in · My Maths Tutor</title>
      </Helmet>
      <div className={styles.hero}>
        <div className={styles.logo} aria-hidden>
          π
        </div>
        <h1 className={styles.title}>Your personal maths tutor</h1>
        <p className={styles.lead}>Patient. Step by step. Never in a rush.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.toggle} role="tablist">
          <button type="button" role="tab" aria-selected={mode === "login"} className={`${styles.tab} ${mode === "login" ? styles.active : ""}`} onClick={() => setMode("login")}>
            Sign in
          </button>
          <button type="button" role="tab" aria-selected={mode === "register"} className={`${styles.tab} ${mode === "register" ? styles.active : ""}`} onClick={() => setMode("register")}>
            New family
          </button>
        </div>
        {mode === "login" ? (
          <PasswordLoginForm />
        ) : (
          <>
            <p className={styles.note}>A parent or guardian makes the account once. After that, the learner stays signed in on their phone.</p>
            <PasswordRegisterForm />
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;