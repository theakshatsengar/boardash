import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
} from "react";
import {
  Activity,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  FolderKanban,
  Globe,
  Hash,
  Inbox,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Terminal,
  UsersRound,
  Blocks,
} from "lucide-react";
import { Button } from "./button";

export type NavItemData = {
  id: string;
  title: string;
  icon: ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

export const navGroups: NavGroupData[] = [
  {
    items: [
      { id: "search", title: "Search", icon: Search, shortcut: "⌘K" },
      { id: "home", title: "Home", icon: LayoutDashboard },
      { id: "inbox", title: "Inbox", icon: Inbox, badge: 12 },
      { id: "analytics", title: "Analytics", icon: Activity },
    ],
  },
  {
    heading: "Workspace",
    items: [
      {
        id: "projects",
        title: "Projects",
        icon: FolderKanban,
        children: [
          { id: "p-active", title: "Active", icon: Hash },
          { id: "p-archived", title: "Archived", icon: Hash },
        ],
      },
      { id: "calendar", title: "Calendar", icon: CalendarDays },
      {
        id: "team",
        title: "Team",
        icon: UsersRound,
        children: [
          { id: "t-design", title: "Designers", icon: Hash },
          { id: "t-eng", title: "Engineering", icon: Hash },
          { id: "t-product", title: "Product", icon: Hash },
        ],
      },
      {
        id: "customers",
        title: "Customers",
        icon: Globe,
        children: [
          { id: "c-enterprise", title: "Enterprise", icon: Hash },
          { id: "c-smb", title: "SMB", icon: Hash },
        ],
      },
      { id: "finance", title: "Finance", icon: CreditCard },
    ],
  },
  {
    heading: "Developers",
    items: [
      { id: "api", title: "API Keys", icon: Terminal },
      { id: "webhooks", title: "Webhooks", icon: Blocks },
    ],
  },
];

const bottomItems: NavItemData[] = [
  { id: "settings", title: "Settings", icon: Settings, shortcut: "⌘," },
  { id: "logout", title: "Log out", icon: LogOut },
];

export const allSidebarItems = [...navGroups.flatMap((group) => group.items), ...bottomItems];

export function flattenNavItems(items: NavItemData[]): NavItemData[] {
  return items.flatMap((item) => [item, ...flattenNavItems(item.children ?? [])]);
}

/**
 * macOS Dock-style magnify effect for the collapsed icon rail.
 *
 * A single MagnifyProvider tracks the cursor's Y position over the rail.
 * Each collapsed icon reports its own vertical center and derives a scale
 * from the distance to the cursor using a Gaussian falloff, so the hovered
 * icon zooms and its neighbours taper off smoothly.
 *
 * Tuned to be deliberately subtle:
 *  - MAX_SCALE keeps the peak zoom small.
 *  - INFLUENCE controls how far the effect spreads to neighbours.
 */
const MAX_SCALE = 1.22; // peak zoom of the hovered icon (very slight)
const INFLUENCE = 58; // px radius over which neighbours are affected

const MagnifyContext = createContext<number | null>(null);

/** Smooth Gaussian falloff -> scale in [1, MAX_SCALE]. */
function scaleForDistance(distance: number): number {
  const falloff = Math.exp(-(distance * distance) / (2 * INFLUENCE * INFLUENCE));
  return 1 + (MAX_SCALE - 1) * falloff;
}

/** Returns the current scale for an icon, tracking its own vertical center. */
function useMagnifyScale(): { ref: React.RefObject<HTMLButtonElement | null>; scale: number } {
  const pointerY = useContext(MagnifyContext);
  const ref = useRef<HTMLButtonElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (pointerY === null || !ref.current) {
      setScale(1);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    setScale(scaleForDistance(Math.abs(pointerY - center)));
  }, [pointerY]);

  return { ref, scale };
}

function CollapsedWorkspaceSwitcher({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (workspace: string) => void;
}) {
  const { ref, scale } = useMagnifyScale();

  return (
    <div className="mb-7 flex justify-center">
      <button
        ref={ref}
        type="button"
        title={selected}
        aria-label={selected}
        onClick={() => onSelect(selected)}
        style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}
        className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-[opacity,transform] duration-150 ease-out hover:opacity-90"
      >
        {selected.charAt(0)}
      </button>
    </div>
  );
}

function WorkspaceSwitcher({
  selected,
  onSelect,
  collapsed = false,
}: {
  selected: string;
  onSelect: (workspace: string) => void;
  collapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const workspaces = ["Acme Corp", "Personal Workspace", "Client Sandbox"];

  if (collapsed) {
    return <CollapsedWorkspaceSwitcher selected={selected} onSelect={onSelect} />;
  }

  return (
    <div className="relative mb-7">
      <Button
        variant="nav"
        size="default"
        onClick={() => setIsOpen((open) => !open)}
        className="h-auto px-2 py-0 hover:bg-accent"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          {selected.charAt(0)}
        </span>
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className="block truncate text-sm font-semibold text-foreground">{selected}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">Pro Plan</span>
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute left-0 top-12 z-50 w-full rounded-lg border border-border bg-card p-1 shadow-2xl"
            role="menu"
          >
            {workspaces.map((workspace) => (
              <Button
                key={workspace}
                variant="nav"
                size="default"
                className={selected === workspace ? "bg-accent text-foreground" : undefined}
                onClick={() => {
                  onSelect(workspace);
                  setIsOpen(false);
                }}
                role="menuitem"
              >
                {workspace}
              </Button>
            ))}
            <div className="my-1 h-px bg-border" />
            <Button variant="nav" size="default" onClick={() => setIsOpen(false)}>
              <span className="mr-1 text-base leading-none">+</span> Create Workspace
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function CollapsedNavItem({
  item,
  activeId,
  onSelect,
  activeWithin,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (item: NavItemData) => void;
  activeWithin: boolean;
}) {
  const { ref, scale } = useMagnifyScale();
  const Icon = item.icon;
  const active = activeId === item.id || activeWithin;

  return (
    <div className="flex justify-center" style={{ marginBottom: `${4 * scale}px` }}>
      <button
        ref={ref}
        type="button"
        title={item.title}
        aria-label={item.title}
        aria-current={activeId === item.id ? "page" : undefined}
        onClick={() => onSelect(item)}
        style={{ transform: `scale(${scale})`, transformOrigin: "left center" }}
        className={`flex size-10 items-center justify-center rounded-lg transition-[background-color,color,transform] duration-150 ease-out ${
          active
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Icon className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
  collapsed = false,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (item: NavItemData) => void;
  level?: number;
  collapsed?: boolean;
}) {
  const activeWithin = item.children?.some((child) => child.id === activeId) ?? false;
  const [isOpen, setIsOpen] = useState(activeWithin);
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);

  if (collapsed) {
    return (
      <CollapsedNavItem
        item={item}
        activeId={activeId}
        onSelect={onSelect}
        activeWithin={activeWithin}
      />
    );
  }

  return (
    <div className="w-full">
      <Button
        variant="nav"
        size="default"
        onClick={() => (hasChildren ? setIsOpen((open) => !open) : onSelect(item))}
        className={activeId === item.id ? "bg-accent text-foreground hover:bg-accent" : undefined}
        style={{ paddingLeft: `${12 + level * 12}px` }}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-current={activeId === item.id ? "page" : undefined}
      >
        <Icon className="mr-3 size-4 shrink-0" strokeWidth={1.5} />
        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
        {item.shortcut && (
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-hover:inline-flex">
            {item.shortcut}
          </kbd>
        )}
        {item.badge !== undefined && (
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronRight
            className={`size-3.5 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
            strokeWidth={1.5}
          />
        )}
      </Button>
      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            {item.children?.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  activeId,
  onSelect,
  activeWorkspace,
  onWorkspaceSelect,
  collapsed = false,
  className = "",
}: {
  activeId: string;
  onSelect: (item: NavItemData) => void;
  activeWorkspace: string;
  onWorkspaceSelect: (workspace: string) => void;
  collapsed?: boolean;
  className?: string;
}) {
  const [pointerY, setPointerY] = useState<number | null>(null);

  return (
    <MagnifyContext.Provider value={collapsed ? pointerY : null}>
      <aside
        onMouseMove={collapsed ? (event) => setPointerY(event.clientY) : undefined}
        onMouseLeave={collapsed ? () => setPointerY(null) : undefined}
        className={`flex h-full shrink-0 flex-col border-r border-border bg-card py-5 ${
          collapsed ? "w-[68px] px-2" : "w-[276px] px-3.5 sm:px-4"
        } ${className}`}
      >
        <WorkspaceSwitcher
          selected={activeWorkspace}
          onSelect={onWorkspaceSelect}
          collapsed={collapsed}
        />
        <nav
          aria-label="Workspace navigation"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navGroups.map((group, index) => (
            <div
              key={group.heading ?? "main"}
              className={index === 0 ? "" : collapsed ? "mt-3" : "mt-5"}
            >
              {group.heading && !collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase text-muted-foreground/70">
                  {group.heading}
                </p>
              )}
              {group.heading && collapsed && index !== 0 && (
                <div className="mx-auto mb-2 h-px w-6 bg-border" />
              )}
              {group.items.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  onSelect={onSelect}
                  collapsed={collapsed}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-4 shrink-0 border-t border-border pt-4">
          {bottomItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              activeId={activeId}
              onSelect={onSelect}
              collapsed={collapsed}
            />
          ))}
        </div>
      </aside>
    </MagnifyContext.Provider>
  );
}
