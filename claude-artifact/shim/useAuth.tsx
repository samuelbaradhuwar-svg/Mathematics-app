// No sign-in screen inside Claude: whoever opens the page is signed in to Claude already.
export const useAuth = () => ({
  authState: { type: "authenticated" as const, user: { id: 1, displayName: "Learner", email: "", role: "user" as const } },
  logout: async () => {},
  login: async () => {},
  onLogin: () => {},
});
export const AuthProvider = ({ children }: { children: React.ReactNode }) => children;
