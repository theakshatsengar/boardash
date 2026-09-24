import { createFileRoute } from "@tanstack/react-router";
import {
  CircleUserRound,
  Command,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  SidebarNav,
  allSidebarItems,
  flattenNavItems,
  type NavItemData,
} from "../components/ui/dashboard-sidebar";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Webhooks | Acme Corp" },
      { name: "description", content: "Manage Acme Corp developer webhooks." },
      { property: "og:title", content: "Webhooks | Acme Corp" },
      { property: "og:description", content: "Manage Acme Corp developer webhooks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { session, loading: authLoading, isConfigured, signOut } = useAuth();
  const [activeId, setActiveId] = useState("webhooks");
  const [activeWorkspace, setActiveWorkspace] = useState("Acme Corp");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLButtonElement>(null);
  const activeItem = flattenNavItems(allSidebarItems).find((item) => item.id === activeId);
  const activeTitle = activeItem?.title ?? "Dashboard";

  // Route guard: bounce to /auth when signed out (only once Supabase is set up).
  useEffect(() => {
    if (isConfigured && !authLoading && !session) {
      navigate({ to: "/auth" });
    }
  }, [isConfigured, authLoading, session, navigate]);

  const handleSelect = (item: NavItemData) => {
    if (item.id === "search") {
      setSearchOpen(true);
      return;
    }
    if (item.id === "logout") {
      void signOut().then(() => navigate({ to: "/auth" }));
      return;
    }
    setActiveId(item.id);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  // While the guard decides, avoid flashing the dashboard for signed-out users.
  // (Placed after all hooks so hook order stays stable across renders.)
  if (isConfigured && (authLoading || !session)) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-canvas p-2.5">
      <div className="relative flex h-full w-full overflow-hidden rounded-2xl border border-border bg-background">
        <div
          className={`hidden shrink-0 overflow-hidden transition-[width] duration-300 md:block ${desktopOpen ? "w-[276px]" : "w-[68px]"}`}
        >
          <SidebarNav
            collapsed={!desktopOpen}
            activeId={activeId}
            onSelect={handleSelect}
            activeWorkspace={activeWorkspace}
            onWorkspaceSelect={setActiveWorkspace}
          />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="relative h-full shadow-2xl">
              <SidebarNav
                activeId={activeId}
                onSelect={handleSelect}
                activeWorkspace={activeWorkspace}
                onWorkspaceSelect={setActiveWorkspace}
              />
              <Button
                variant="icon"
                size="icon"
                className="absolute right-3 top-3 size-8"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-[60px] items-center gap-3 border-b border-border px-4 sm:h-[64px] sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 p-0 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </Button>
            <div className="hidden min-w-0 flex-1 items-center gap-5 md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 p-0"
                onClick={() => setDesktopOpen((open) => !open)}
                aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {desktopOpen ? (
                  <PanelLeftClose className="size-4 text-muted-foreground" strokeWidth={1.5} />
                ) : (
                  <PanelLeftOpen className="size-4 text-muted-foreground" strokeWidth={1.5} />
                )}
              </Button>
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="truncate text-muted-foreground">{activeWorkspace}</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-semibold text-foreground">{activeTitle}</span>
              </div>
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold md:hidden">{activeTitle}</p>
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
              <button
                type="button"
                ref={searchRef}
                onClick={() => setSearchOpen(true)}
                aria-label="Search dashboard"
                className="hidden h-9 w-[180px] items-center gap-2 rounded-lg bg-input px-3 text-xs text-muted-foreground outline-none ring-ring transition-colors hover:bg-accent focus-visible:ring-1 sm:flex lg:w-[272px]"
              >
                <Search className="size-4 shrink-0" strokeWidth={1.5} />
                <span className="flex-1 truncate text-left">Search...</span>
                <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] lg:inline-flex">
                  ⌘K
                </kbd>
              </button>
              <Button variant="icon" size="icon" aria-label="Account menu">
                <CircleUserRound className="size-4" strokeWidth={1.5} />
              </Button>
            </div>
          </header>

          <section
            aria-label="Webhook dashboard"
            className="min-h-0 flex-1 overflow-y-auto px-4 py-7 sm:px-8 sm:py-9 lg:px-9"
          >
            <div className="mb-8 h-9 w-[204px] max-w-[58%] animate-pulse rounded-lg bg-muted" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div className="aspect-[1.7/0.8] rounded-xl border border-border bg-card sm:aspect-[1.7/0.8]" />
              <div className="aspect-[1.7/0.8] rounded-xl border border-border bg-card" />
            </div>
            <div className="mt-6 rounded-xl border border-border bg-card px-4 py-6 sm:px-6 sm:py-7">
              <div className="h-5 w-48 max-w-[52%] animate-pulse rounded-md bg-muted" />
              <div className="my-6 h-px bg-border" />
              <div className="space-y-4">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="h-[52px] animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          </section>
        </main>

        {searchOpen && (
          <div className="absolute inset-0 z-[60] flex items-start justify-center bg-background/70 px-4 pt-[15vh] backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => setSearchOpen(false)}
              aria-hidden="true"
            />
            <div
              className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Search dashboard"
            >
              <div className="flex items-center border-b border-border px-4">
                <Search
                  className="mr-3 size-[18px] shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <input
                  autoFocus
                  className="flex-1 bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  placeholder="Search projects, docs, or actions..."
                />
                <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
                  ESC
                </kbd>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 size-8"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center py-8">
                <Command className="mb-2 size-6 text-muted-foreground/40" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-muted-foreground">
                  Type a command or search...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
