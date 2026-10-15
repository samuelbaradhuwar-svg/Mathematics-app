import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../helpers/useAuth";
import { useLearnerMe, useSetupLearner } from "../helpers/useLearnerData";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Spinner } from "../components/Spinner";
import { AuthLoadingState } from "../components/AuthLoadingState";
import styles from "./welcome.module.css";

const WelcomePage: React.FC = () => {
  const { authState } = useAuth();
  const me = useLearnerMe();
  const setup = useSetupLearner();
  const navigate = useNavigate();
  const [name, setName] = useState("Judah");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (me.data?.learner) navigate("/", { replace: true });
  }, [me.data, navigate]);

  if (authState.type === "loading") return <AuthLoadingState title="One moment" />;
  if (authState.type === "unauthenticated") return <Navigate to="/login" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please type the learner's name.");
    if (!/^\d{4,6}$/.test(pin)) return setError("The parent PIN must be 4 to 6 numbers.");
    if (pin !== pin2) return setError("The two PINs don't match.");
    setup.mutate(
      { name: name.trim(), parentPin: pin },
      {
        onSuccess: () => {
          toast.success(`Welcome, ${name.trim()}!`);
          navigate("/", { replace: true });
        },
        onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong."),
      }
    );
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Welcome · My Maths Tutor</title>
      </Helmet>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.logo} aria-hidden>
          π
        </div>
        <h1 className={styles.title}>Let's set up the maths tutor</h1>
        <p className={styles.lead}>This takes one minute. A parent or guardian should fill this in.</p>

        <label className={styles.label} htmlFor="learner-name">
          Learner's name
        </label>
        <Input id="learner-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="off" className={styles.input} />

        <label className={styles.label} htmlFor="parent-pin">
          Parent PIN (4 to 6 numbers)
        </label>
        <p className={styles.help}>This keeps the parent area private. Please don't share it with the learner.</p>
        <Input id="parent-pin" type="password" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} maxLength={6} autoComplete="new-password" className={styles.input} />

        <label className={styles.label} htmlFor="parent-pin2">
          Type the PIN again
        </label>
        <Input id="parent-pin2" type="password" inputMode="numeric" pattern="[0-9]*" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} maxLength={6} autoComplete="new-password" className={styles.input} />

        {error ? <div className={styles.error}>{error}</div> : null}

        <Button type="submit" size="lg" disabled={setup.isPending} className={styles.submit}>
          {setup.isPending ? <Spinner size="sm" /> : "Start learning"}
        </Button>
        <p className={styles.fine}>This tutor follows the South African Grade 8 CAPS Mathematics curriculum.</p>
      </form>
    </div>
  );
};

export default WelcomePage;