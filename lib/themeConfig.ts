// Shared by the server layout (no-flash script) and the client theme hook (lib/theme.ts).

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "pitchline-theme";

export const THEME_META_COLORS: Record<Theme, string> = { dark: "#0D0E12", light: "#FCFCFA" };

/** Inline script for <head>: applies a saved light theme before first paint (no flash of dark). */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="light"){document.documentElement.dataset.theme="light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","${THEME_META_COLORS.light}")}}catch(e){}`;
