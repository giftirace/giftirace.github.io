import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../css/LoginPage.module.scss";
import { buildApiUrl, setAuthToken } from "../utils/api";

type LoginResponse = {
  token: string;
  expiresAt: number;
  user: {
    username: string;
  };
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname || "/";
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as LoginResponse | { message?: string };
      const message = "message" in data ? data.message : "";

      if (!response.ok || !("token" in data)) {
        setError(message || "Login failed. Please check your username and password.");
        return;
      }

      setAuthToken(data.token);
      navigate(from, { replace: true });
    } catch {
      setError("Cannot reach the backend service right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <h1>Login</h1>
        <p>Log in before publishing through the backend.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <div className={styles.error}>{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  );
}
