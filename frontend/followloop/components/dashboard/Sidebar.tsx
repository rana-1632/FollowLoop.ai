"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLayout } from "@/lib/layout-context";
import {
  LayoutGrid,
  Users,
  Workflow,
  BarChart3,
  Settings,
  Zap,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import Logo from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Sequence Builder", href: "/automation-builder", icon: Workflow },
  { label: "Sequence Tracking", href: "/sequences", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar({
  onOpenProfile,
  onOpenEmailAccounts,
}: {
  onOpenProfile?: () => void;
  onOpenEmailAccounts?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapse, isMobileOpen, closeMobile } = useLayout();

  const renderNavLinks = (collapsed: boolean, isMobile: boolean = false) => (
    <nav className="flex-1 space-y-1.5 px-3 py-4" aria-label="Dashboard Navigation">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => {
              if (isMobile) closeMobile();
            }}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex items-center h-10 rounded-xl transition-all duration-200 select-none",
              collapsed ? "px-1.5 justify-center" : "px-2.5",
              active
                ? "bg-accent-50 text-accent-700 font-bold shadow-2xs"
                : "text-ink-soft hover:bg-surface-muted hover:text-ink"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center shrink-0">
              <item.icon
                size={18}
                className={cn(
                  "transition-colors",
                  active ? "text-accent-600" : "text-ink-muted group-hover:text-ink-soft"
                )}
              />
            </div>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap min-w-0 flex-1",
                collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[170px] opacity-100 ml-2"
              )}
            >
              <span className="text-xs font-semibold truncate block">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Floating Toggle & Buttery-Smooth Animations)           */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface shadow-xs transition-all duration-300 ease-in-out lg:flex",
          isCollapsed ? "w-[72px]" : "w-[248px]"
        )}
      >
        {/* Floating Toggle Button (Sits on sidebar border edge, eliminates merging) */}
        <button
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="absolute -right-3.5 top-5 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-ink-muted shadow-md hover:border-accent-400 hover:bg-surface-muted hover:text-accent-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-4 border-b border-border overflow-hidden shrink-0">
          {!isCollapsed ? (
            <Link href="/" className="flex items-center min-w-0 transition-opacity duration-300">
              <Logo />
            </Link>
          ) : (
            <Link href="/" title="FollowLoop.ai" className="mx-auto">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white font-black text-xs shadow-sm hover:scale-105 transition-transform">
                FL
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Section */}
        {renderNavLinks(isCollapsed)}

        {/* Custom Email Accounts Button */}
        {onOpenEmailAccounts && (
          <div className="px-3 mb-2 shrink-0">
            <button
              onClick={onOpenEmailAccounts}
              title={isCollapsed ? "Sending Email Accounts" : undefined}
              className={cn(
                "w-full flex items-center h-10 rounded-xl border border-border bg-surface hover:bg-surface-muted transition-colors text-xs font-semibold text-ink-soft select-none",
                isCollapsed ? "justify-center px-1.5" : "justify-between px-2.5"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center shrink-0">
                  <Mail size={16} className="text-accent-600" />
                </div>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap min-w-0",
                    isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[130px] opacity-100"
                  )}
                >
                  <span className="truncate">Sending Accounts</span>
                </div>
              </div>

              {!isCollapsed && (
                <span className="text-[10px] text-accent-600 font-bold bg-accent-50 px-1.5 py-0.5 rounded-md shrink-0 transition-opacity duration-300">
                  Config
                </span>
              )}
            </button>
          </div>
        )}

        {/* Upgrade Card */}
        <div className="px-3 mb-3 shrink-0">
          {!isCollapsed ? (
            <div className="rounded-2xl border border-accent-100 bg-accent-50/90 p-3.5 transition-all duration-300">
              <div className="mb-1 flex items-center gap-2 text-accent-700">
                <Zap size={15} className="shrink-0" />
                <span className="text-xs font-bold truncate">Upgrade to Growth</span>
              </div>
              <p className="text-[10.5px] leading-relaxed text-accent-700/80">
                Unlock unlimited AI follow-ups & reply tracking.
              </p>
              <button className="btn-accent mt-2.5 w-full py-1.5 text-[11px] font-bold shadow-2xs">
                Upgrade now
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                title="Upgrade to Growth Plan"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-600 border border-accent-200 hover:bg-accent-100 transition-colors shadow-2xs"
              >
                <Zap size={16} />
              </button>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="border-t border-border p-3 space-y-1.5 shrink-0">
          {user && (
            <div
              className={cn(
                "flex items-center h-11 rounded-xl border border-border bg-surface-muted/60 px-2 transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar src={user.avatarUrl} name={user.name || user.email} size="sm" />
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap min-w-0",
                    isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[120px] opacity-100"
                  )}
                >
                  <p className="font-semibold text-ink truncate text-xs leading-tight">{user.name}</p>
                  <p className="text-ink-muted truncate text-[10px] leading-tight">
                    {user.company || user.email}
                  </p>
                </div>
              </div>

              {!isCollapsed && onOpenProfile && (
                <button
                  onClick={onOpenProfile}
                  title="Edit Profile Settings"
                  className="p-1 text-ink-muted hover:text-accent-600 hover:bg-surface rounded-lg transition-colors shrink-0"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>
          )}

          <button
            onClick={logout}
            title={isCollapsed ? "Log out" : undefined}
            className={cn(
              "w-full flex items-center h-9 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors select-none",
              isCollapsed ? "justify-center px-1.5" : "px-2.5"
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center shrink-0">
              <LogOut size={15} />
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap min-w-0",
                isCollapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[120px] opacity-100 ml-1.5"
              )}
            >
              <span>Log out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE OVERLAY DRAWER (< 1024px)                                       */}
      {/* ========================================================================= */}
      <div
        onClick={closeMobile}
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-surface shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5 shrink-0">
          <Link href="/" onClick={closeMobile}>
            <Logo />
          </Link>
          <button
            onClick={closeMobile}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface-muted text-ink-muted hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {renderNavLinks(false, true)}

        {onOpenEmailAccounts && (
          <div className="px-3 mb-2 shrink-0">
            <button
              onClick={() => {
                closeMobile();
                onOpenEmailAccounts();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-border bg-surface hover:bg-surface-muted p-3 text-xs font-semibold text-ink-soft transition-colors"
            >
              <span className="flex items-center gap-2">
                <Mail size={16} className="text-accent-600 shrink-0" /> Sending Accounts
              </span>
              <span className="text-[10px] text-accent-600 font-bold bg-accent-50 px-1.5 py-0.5 rounded-md">
                Config
              </span>
            </button>
          </div>
        )}

        <div className="px-3 mb-3 shrink-0">
          <div className="rounded-2xl border border-accent-100 bg-accent-50 p-4">
            <div className="mb-1.5 flex items-center gap-2 text-accent-700">
              <Zap size={15} />
              <span className="text-xs font-bold">Upgrade to Growth</span>
            </div>
            <p className="text-[11px] leading-relaxed text-accent-700/80">
              Unlock unlimited sequences & AI reply detection.
            </p>
            <button className="btn-accent mt-3 w-full py-2 text-xs font-bold">Upgrade now</button>
          </div>
        </div>

        <div className="space-y-2 border-t border-border px-3 py-4 shrink-0">
          {user && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar src={user.avatarUrl} name={user.name || user.email} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink truncate text-xs">{user.name}</p>
                  <p className="text-ink-muted truncate text-[10.5px]">
                    {user.company || user.email}
                  </p>
                </div>
              </div>
              {onOpenProfile && (
                <button
                  onClick={() => {
                    closeMobile();
                    onOpenProfile();
                  }}
                  title="Edit Profile Settings"
                  className="p-1 text-ink-muted hover:text-accent-600 hover:bg-surface rounded-lg transition-colors shrink-0"
                >
                  <Settings size={16} />
                </button>
              )}
            </div>
          )}
          <button
            onClick={() => {
              closeMobile();
              logout();
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
