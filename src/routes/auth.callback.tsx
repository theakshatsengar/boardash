import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing you in… | Acme Corp" }],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate({ to: "/auth" });
      return;
    }

    let active = true;

    // detectSessionInUrl exchanges the code/hash for a session automatically;
    // we just wait for it to land, then route the user onward.
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        return;
      }
      navigate({ to: data.session ? "/" : "/auth" });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/" });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-sm">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-foreground">Sign-in failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              type="button"
              onClick={() => navigate({ to: "/auth" })}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
          </>
        )}
      </div>
    </div>
  );
}
