"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Plus,
  User as UserIcon,
  Mail,
  CheckCheck,
  Sparkles,
  MessageSquare,
  Clock,
  ArrowRight,
  X,
  Menu,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLayout } from "@/lib/layout-context";
import UserAvatar from "@/components/ui/UserAvatar";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "reply" | "dispatch" | "system";
}

export default function Topbar({
  title,
  subtitle,
  onNewContactClick,
  onOpenProfile,
  onOpenEmailAccounts,
  onSearchChange,
  searchQuery = "",
}: {
  title: string;
  subtitle?: string;
  onNewContactClick?: () => void;
  onOpenProfile?: () => void;
  onOpenEmailAccounts?: () => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}) {
  const { user } = useAuth();
  const { toggleMobileOpen } = useLayout();
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Sequence Active",
      message: "Follow-up sequence active for new leads.",
      time: "10m ago",
      read: false,
      type: "dispatch",
    },
    {
      id: "n2",
      title: "Custom Sender Verified",
      message: "Sending account identity verified.",
      time: "1h ago",
      read: false,
      type: "system",
    },
    {
      id: "n3",
      title: "Inbound Webhook Ready",
      message: "Automated reply tracking enabled.",
      time: "2h ago",
      read: true,
      type: "reply",
    },
  ]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setInternalQuery(q);
    setShowSearchResults(q.trim().length > 0);
    if (onSearchChange) {
      onSearchChange(q);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 sm:px-6 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle Button */}
        <button
          onClick={toggleMobileOpen}
          aria-label="Open Navigation Menu"
          title="Open Navigation Menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-ink-soft hover:bg-surface-muted hover:text-accent-600 transition-colors lg:hidden shrink-0"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-ink truncate">{title}</h1>
          {subtitle ? (
            <p className="text-[11px] sm:text-xs text-ink-muted truncate">{subtitle}</p>
          ) : user?.name ? (
            <p className="text-[11px] sm:text-xs text-ink-muted truncate">
              Welcome back, <span className="font-semibold text-ink-soft">{user.name}</span>
              {user.company ? ` (${user.company})` : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div ref={searchRef} className="relative hidden sm:block">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3.5 py-2 transition-all focus-within:border-accent-400 focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent-100">
            <Search size={15} className="text-ink-muted shrink-0" />
            <input
              type="text"
              value={internalQuery}
              onChange={handleQueryChange}
              onFocus={() => setShowSearchResults(internalQuery.trim().length > 0)}
              placeholder="Search contacts, sequences…"
              className="w-48 md:w-56 bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted"
            />
            {internalQuery && (
              <button
                onClick={() => {
                  setInternalQuery("");
                  setShowSearchResults(false);
                  if (onSearchChange) onSearchChange("");
                }}
                className="p-0.5 rounded-full hover:bg-surface-muted text-ink-muted"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchResults && (
            <div className="absolute left-0 right-0 mt-2 z-50 w-72 rounded-2xl border border-border bg-surface shadow-2xl p-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-border text-[11px] font-bold text-ink-muted uppercase">
                <span>Filter Results ({internalQuery})</span>
                <span className="text-[10px] text-accent-600">Live Match</span>
              </div>
              <div className="py-2 space-y-1.5 max-h-48 overflow-y-auto">
                <div className="p-2 rounded-xl hover:bg-surface-muted cursor-pointer transition-colors">
                  <p className="text-xs font-semibold text-ink truncate">Matching Contacts & Pipeline</p>
                  <p className="text-[10px] text-ink-muted">Filtering active workspace view for "{internalQuery}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bell Icon / Notification Popover */}
        <div ref={popoverRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            title="System Notifications & Reply Alerts"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft hover:bg-surface-muted hover:text-accent-600 transition-colors"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel & Mobile Overlay */}
          {showNotifications && (
            <>
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden"
                onClick={() => setShowNotifications(false)}
              />

              <div className="fixed left-3 right-3 top-16 z-50 max-w-sm ml-auto rounded-2xl border border-border bg-surface shadow-2xl p-4 animate-in slide-in-from-top-2 duration-200 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-ink">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-600">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-accent-600 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck size={13} /> Mark read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 text-ink-muted hover:bg-surface-muted rounded-lg sm:hidden"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="py-2 space-y-2.5 max-h-64 sm:max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        n.read
                          ? "border-border/50 bg-surface-muted/30"
                          : "border-accent-200 bg-accent-50/40 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-ink flex items-center gap-1.5 min-w-0 truncate">
                          <Sparkles size={12} className="text-accent-500 shrink-0" />
                          <span className="truncate">{n.title}</span>
                        </p>
                        <span className="text-[10px] text-ink-muted flex items-center gap-0.5 shrink-0">
                          <Clock size={9} /> {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border text-center">
                  <p className="text-[10px] text-ink-muted">Automated reply tracking enabled</p>
                </div>
              </div>
            </>
          )}
        </div>

        {onOpenEmailAccounts && (
          <button
            onClick={onOpenEmailAccounts}
            aria-label="Custom Sending Identities"
            title="Configure Sending Email Accounts"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink-soft hover:bg-surface-muted hover:text-accent-600 transition-colors"
          >
            <Mail size={16} />
          </button>
        )}

        {onNewContactClick && (
          <button
            onClick={onNewContactClick}
            className="btn-accent hidden py-2 text-sm sm:inline-flex"
          >
            <Plus size={15} /> New contact
          </button>
        )}

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-2.5 hover:bg-surface-muted hover:border-accent-300 transition-all group"
          title="Edit Profile"
        >
          <UserAvatar src={user?.avatarUrl} name={user?.name || user?.email} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-ink group-hover:text-accent-600 transition-colors leading-tight">
              {user?.name || "My Account"}
            </p>
            <p className="text-[10px] text-ink-muted leading-tight">
              {user?.company || user?.email || "Edit profile"}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
