import React from "react";
import { Spinner } from "./Spinner";

export const AuthLoadingState: React.FC<{ title?: string }> = ({ title = "One moment" }) => (
  <div style={{ display: "grid", placeItems: "center", gap: 12, minHeight: "50dvh", textAlign: "center" }}>
    <Spinner size="lg" />
    <p style={{ margin: 0, fontFamily: "var(--font-family-heading)", fontSize: "1.2rem" }}>{title}</p>
  </div>
);
