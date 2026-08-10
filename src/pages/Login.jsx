import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              display_name: name,
            });

          if (profileError) {
            console.error(
              "Profile creation error:",
              profileError
            );
          }
        }

        setMessage(
          "Account created. Check your email if confirmation is required."
        );

        setIsSignup(false);
        setPassword("");
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        navigate("/");
      }
    } catch (err) {
      setError(
        err?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setMessage("");
    setGoogleLoading(true);

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });

      if (error) throw error;
    } catch (err) {
      console.error("Google login error:", err);

      setError(
        err?.message ||
          "Unable to continue with Google."
      );

      setGoogleLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup((previous) => !previous);
    setError("");
    setMessage("");
    setPassword("");
  }

  return (
    <main className="login-page">
      <section className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span>JEE</span>
          <strong>TUBE</strong>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>
            {isSignup
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p>
            {isSignup
              ? "Build your personalized JEE learning library."
              : "Continue your JEE preparation."}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-message error">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="login-message success">
            {message}
          </div>
        )}

        {/* Google Login */}
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
        >
          <span className="google-icon">
            G
          </span>

          {googleLoading
            ? "Connecting to Google..."
            : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* Email / Password */}
        <form onSubmit={handleSubmit}>

          {isSignup && (
            <div className="input-group">
              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                disabled={
                  loading || googleLoading
                }
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              disabled={
                loading || googleLoading
              }
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength={6}
              required
              disabled={
                loading || googleLoading
              }
            />
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={
              loading || googleLoading
            }
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {/* Switch login/signup */}
        <div className="login-switch">
          <span>
            {isSignup
              ? "Already have an account?"
              : "New to JEE-Tube?"}
          </span>

          <button
            type="button"
            onClick={toggleMode}
            disabled={
              loading || googleLoading
            }
          >
            {isSignup
              ? "Sign in"
              : "Create account"}
          </button>
        </div>

        {/* Footer */}
        <div className="login-footer">
          Your learning data, bookmarks and notes stay
          connected to your account.
        </div>

      </section>
    </main>
  );
}