import React, { useEffect } from "react";

// Keeps the browser-tab title in step with the page (the only part of react-helmet we use).
export const Helmet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const kids = React.Children.toArray(children) as React.ReactElement<{ children?: React.ReactNode }>[];
  const t = kids.find((k) => k && (k as { type?: string }).type === "title");
  const text = t ? String(React.Children.toArray(t.props.children).join("")) : "";
  useEffect(() => {
    if (text) document.title = text;
  }, [text]);
  return null;
};
