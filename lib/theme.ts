"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, THEME_META_COLORS, type Theme } from "@/lib/themeConfig";

// ============================================================
// Theme: dark by default, light is opt-in from Settings → Appearance.
// The choice lives on <html data-theme="light"> (CSS in globals.css)
// and in localStorage so it survives reloads.
// ============================================================

export type { Theme };

const THEME_EVENT = "pitchline-theme-change";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;

  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_META_COLORS[theme]);

  try {
    if (theme === "light") localStorage.setItem(THEME_STORAGE_KEY, "light");
    else localStorage.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

/** Current theme; the server always renders dark, then the client catches up. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}
