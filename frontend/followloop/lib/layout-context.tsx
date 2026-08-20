"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleMobileOpen: () => void;
  closeMobile: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggleCollapse: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  toggleMobileOpen: () => {},
  closeMobile: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Sync stored desktop sidebar collapse preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("followloop_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("followloop_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const toggleMobileOpen = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <LayoutContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileOpen,
        closeMobile,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
