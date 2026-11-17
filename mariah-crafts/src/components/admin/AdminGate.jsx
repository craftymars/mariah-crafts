
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import CMSPixelBackground from "./CMSPixelBackground";
import "./admin.css";

export default function AdminGate({ children }) {
  const [status, setStatus] = useState("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        setStatus("signed-out");
        return;
      }

      const { data, error: accessError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      setStatus(
        !accessError && data ? "authorized" : "denied"
      );
    }

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAccess();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError(
          "Unable to sign in. Check your email and password."
        );
      }
    } catch {
      setError(
        "Unable to connect. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    const { error: logoutError } =
      await supabase.auth.signOut();

    if (logoutError) {
      setError("Unable to sign out. Please try again.");
      return;
    }

    setStatus("signed-out");
    setPassword("");
    setError("");
  }

  if (status === "loading") {
    return (
      <main className="admin-screen">
        <CMSPixelBackground />

        <div className="admin-login">
          <p className="admin-eyebrow">
            ♡ MARIAH CRAFTS OS
          </p>

          <h1>Starting System...</h1>

          <p className="admin-subtitle" role="status">
            Checking your workspace access.
          </p>

          <div className="admin-loading-indicator">
            <span />
            <span />
            <span />
          </div>
        </div>
      </main>
    );
  }

  if (status === "denied") {
    return (
      <main className="admin-screen">
        <CMSPixelBackground />

        <div className="admin-login">
          <p className="admin-eyebrow">
            ♡ MARIAH CRAFTS OS
          </p>

          <h1>Access Denied ♡</h1>

          <p className="admin-subtitle">
            This account does not have
            administrator permissions.
          </p>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  if (status === "signed-out") {
    return (
      <main className="admin-screen">
        <CMSPixelBackground />

        <form
          className="admin-login"
          onSubmit={handleLogin}
        >
          <p className="admin-eyebrow">
            ♡ mariah_crafts_os
          </p>

          <h1>Control Center</h1>

          <p className="admin-subtitle">
            Your private creative workspace.
          </p>

          <label htmlFor="admin-email">
            Email Address
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
          />

          <label htmlFor="admin-password">
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
          />

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy}>
            {busy
              ? "Signing In..."
              : "Enter Control Center ♡"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      {children}

      <button
        type="button"
        className="admin-logout"
        onClick={handleLogout}
      >
        Sign Out
      </button>
    </>
  );
}
