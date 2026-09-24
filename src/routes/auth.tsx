import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { FlutedGlass } from "@paper-design/shaders-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Acme Corp" },
      { name: "description", content: "Sign in to your Acme Corp workspace." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1a6.2 6.2 0 1 1 0-12.4c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 2.9 14.7 2 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
      />
    </svg>
  );
}

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const {
    session,
    loading: authLoading,
    isConfigured,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";

  // Already signed in -> go to the dashboard.
  useEffect(() => {
    if (!authLoading && session) navigate({ to: "/" });
  }, [authLoading, session, navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isConfigured) {
      setError("Supabase is not configured yet. Add your project URL and anon key to .env.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      if (isForgot) {
        const { error: resetError } = await resetPassword(email);
        if (resetError) setError(resetError.message);
        else setNotice("Check your inbox for a password reset link.");
        return;
      }

      if (isSignup) {
        const { error: signUpError } = await signUpWithPassword(email, password, {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setNotice("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
        }
        return;
      }

      const { error: signInError } = await signInWithPassword(email, password);
      if (signInError) setError(signInError.message);
      else navigate({ to: "/" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    if (!isConfigured) {
      setError("Supabase is not configured yet. Add your project URL and anon key to .env.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: oauthError } = await signInWithGoogle();
    if (oauthError) {
      setError(oauthError.message);
      setSubmitting(false);
    }
    // On success the browser redirects to Google, so no further work here.
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-white/10 bg-white/[0.07] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/25 disabled:opacity-60";

  const heading = isForgot
    ? "Reset your password"
    : isSignup
      ? "Create your account"
      : "Welcome back";
  const subheading = isForgot
    ? "Enter your email and we'll send you a reset link."
    : isSignup
      ? "Start tracking your workspace in minutes."
      : "Sign in to continue to your workspace.";
  const submitLabel = isForgot ? "Send reset link" : isSignup ? "Create account" : "Sign in";

  return (
    <section className="dark min-h-screen bg-[#050505] p-3 text-white [font-synthesis:none]">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* LEFT — form card */}
        <div className="flex items-center justify-center rounded-md border border-white/10 bg-[#17171b] px-6 py-12 lg:px-14 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto w-full max-w-[460px]"
          >
            <div className="mb-8">
              <div className="mb-6 grid size-10 place-items-center rounded-md bg-white text-lg font-bold text-black">
                A
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
              <p className="mt-1.5 text-sm text-white/50">{subheading}</p>
            </div>

            {!isConfigured && (
              <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-xs text-amber-200">
                Supabase isn't configured. Add <code className="font-mono">VITE_SUPABASE_URL</code>{" "}
                and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your{" "}
                <code className="font-mono">.env</code> file.
              </div>
            )}

            {!isForgot && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] text-sm font-medium transition-colors hover:bg-white/[0.12] disabled:opacity-60"
                >
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs uppercase tracking-wide text-white/40">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">First name</label>
                    <input
                      className={inputClass}
                      placeholder="Ada"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">Last name</label>
                    <input
                      className={inputClass}
                      placeholder="Lovelace"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">Email</label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {!isForgot && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-white/60">Password</label>
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs text-white/50 transition-colors hover:text-white"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      className={`${inputClass} pr-11`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-white/50 transition-colors hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              )}

              {isSignup && (
                <label className="flex items-start gap-2.5 text-xs text-white/50">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 size-3.5 rounded border-white/20 bg-white/[0.07]"
                  />
                  <span>I agree to the Terms of Service and Privacy Policy.</span>
                </label>
              )}

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
                  {error}
                </p>
              )}
              {notice && (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-200">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitLabel}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              {isForgot ? (
                <>
                  Remembered it?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-medium text-white underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </button>
                </>
              ) : isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="font-medium text-white underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-white underline-offset-4 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>

        {/* RIGHT — shader marketing panel (desktop only) */}
        <div className="relative hidden overflow-hidden rounded-md bg-linear-to-b from-black to-[#050505] p-8 text-white lg:flex lg:p-16">
          <div className="pointer-events-none absolute inset-0 z-0">
            <FlutedGlass
              size={0.89}
              shape="lines"
              distortionShape="prism"
              distortion={0.5}
              edges={0.25}
              scale={1.11}
              fit="cover"
              highlights={0.1}
              shadows={0.2}
              grainMixer={0.1}
              grainOverlay={0.1}
              colorBack="#00000000"
              colorHighlight="#FFFFFF"
              colorShadow="#000000"
              className="h-full w-full bg-transparent"
            />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between">
            <motion.blockquote
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-md text-2xl font-medium leading-snug tracking-tight"
            >
              “The cleanest way we've found to keep the whole team on the same page.”
              <footer className="mt-4 text-sm font-normal text-white/50">
                — Jordan Reyes, Head of Ops
              </footer>
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="mt-12 origin-bottom-left overflow-hidden rounded-lg border border-white/10 bg-[#0d0d10] shadow-2xl lg:-rotate-3"
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="ml-3 rounded bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/40">
                  app.acme.co/dashboard
                </span>
              </div>
              <div className="grid gap-3 p-4">
                <div className="h-6 w-2/5 rounded bg-white/[0.08]" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-lg bg-white/[0.05]" />
                  <div className="h-20 rounded-lg bg-white/[0.05]" />
                </div>
                <div className="h-24 rounded-lg bg-white/[0.05]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
