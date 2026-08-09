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
            console.error("Profile creation error:", profileError);
          }
        }

        setMessage(
          "Account created. Check your email if confirmation is required."
        );

        setIsSignup(false);
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-background" />

      <section className="login-card">
        <div className="login-logo">
          <span>JEE</span>
          <strong>TUBE</strong>
        </div>

        <div className="login-heading">
          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>

          <p>
            {isSignup
              ? "Build your personalized JEE learning library."
              : "Continue your JEE preparation."}
          </p>
        </div>

        {error && <div className="login-message error">{error}</div>}

        {message && (
          <div className="login-message success">{message}</div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <label>Full name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <div className="login-switch">
          <span>
            {isSignup
              ? "Already have an account?"
              : "New to JEE-Tube?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setMessage("");
            }}
          >
            {isSignup ? "Sign in" : "Create account"}
          </button>
        </div>

        <div className="login-footer">
          Your learning data, bookmarks and notes stay connected to your
          account.
        </div>
      </section>
    </main>
  );
}