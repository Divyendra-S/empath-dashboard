import type { CSSProperties } from "react";

const primaryHex = "#7839EE";
const primaryHoverHex = "#6A2ED8";
const primaryActiveHex = "#5C23C8";
const surfaceHex = "#F5EEFF";
const surfaceStrongHex = "#EFE0FF";
const borderHex = "#E1D4FF";
const borderStrongHex = "#CBB6FF";
const accentHex = "#DCCBFF";
const tagBgHex = "#F0E5FF";
const tagTextHex = "#5A2DCA";

const hexToRgbTuple = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return [r, g, b];
};

const toRgbString = ([r, g, b]: [number, number, number]) => `${r} ${g} ${b}`;

const toRgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgbTuple(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const primaryRgb = toRgbString(hexToRgbTuple(primaryHex));
const primaryHoverRgb = toRgbString(hexToRgbTuple(primaryHoverHex));
const primaryActiveRgb = toRgbString(hexToRgbTuple(primaryActiveHex));
const primaryForegroundRgb = "255 255 255";
const surfaceRgb = toRgbString(hexToRgbTuple(surfaceHex));
const surfaceStrongRgb = toRgbString(hexToRgbTuple(surfaceStrongHex));
const borderRgb = toRgbString(hexToRgbTuple(borderHex));
const borderStrongRgb = toRgbString(hexToRgbTuple(borderStrongHex));
const accentRgb = toRgbString(hexToRgbTuple(accentHex));
const tagBgRgb = toRgbString(hexToRgbTuple(tagBgHex));

const panelGradient = `linear-gradient(135deg, ${toRgba(primaryHex, 0.18)} 0%, ${toRgba(primaryHex, 0.06)} 55%, ${toRgba(primaryHex, 0.18)} 100%)`;
const sidebarGradient = `linear-gradient(180deg, ${toRgba(primaryHex, 0.18)} 0%, ${toRgba(primaryHex, 0.08)} 45%, ${toRgba(primaryHex, 0.03)} 100%)`;
const badgeGradient = `linear-gradient(135deg, ${toRgba(primaryHex, 0.16)}, ${toRgba(primaryHex, 0.08)})`;
const iconGradient = `linear-gradient(135deg, ${toRgba(primaryHex, 0.22)}, ${toRgba(primaryHex, 0.34)})`;

const highlight = toRgba(primaryHex, 0.08);
const highlightStrong = toRgba(primaryHex, 0.15);
const focusBorder = toRgba(primaryHex, 0.4);
const ghostHover = toRgba(primaryHex, 0.08);
const ghostBorder = toRgba(primaryHex, 0.18);

const shadowPrimary = `0 20px 40px -22px ${toRgba(primaryHex, 0.45)}`;

export const themeConfig = {
  colors: {
    primary: primaryHex,
    primaryRgb,
    primaryHover: primaryHoverHex,
    primaryHoverRgb,
    primaryActive: primaryActiveHex,
    primaryActiveRgb,
    primaryForeground: "#FFFFFF",
    primaryForegroundRgb,
    surface: surfaceHex,
    surfaceRgb,
    surfaceStrong: surfaceStrongHex,
    surfaceStrongRgb,
    border: borderHex,
    borderRgb,
    borderStrong: borderStrongHex,
    borderStrongRgb,
    accent: accentHex,
    accentRgb,
    tagBg: tagBgHex,
    tagBgRgb,
    tagText: tagTextHex,
    highlight,
    highlightStrong,
    focusBorder,
    ghostHover,
    ghostBorder,
    ring: toRgba(primaryHex, 0.35),
    shadowPrimary,
  },
  gradients: {
    panel: panelGradient,
    sidebar: sidebarGradient,
    badge: badgeGradient,
    icon: iconGradient,
  },
};

export const themeVariables = {
  "--theme-primary": primaryRgb,
  "--theme-primary-hex": primaryHex,
  "--theme-primary-hover": primaryHoverRgb,
  "--theme-primary-hover-hex": primaryHoverHex,
  "--theme-primary-active": primaryActiveRgb,
  "--theme-primary-foreground": primaryForegroundRgb,
  "--theme-surface": surfaceRgb,
  "--theme-surface-solid": surfaceStrongRgb,
  "--theme-border": borderRgb,
  "--theme-border-strong": borderStrongRgb,
  "--theme-accent": accentRgb,
  "--theme-tag-bg": tagBgRgb,
  "--theme-tag-text": tagTextHex,
  "--theme-highlight": highlight,
  "--theme-highlight-strong": highlightStrong,
  "--theme-gradient-panel": panelGradient,
  "--theme-gradient-sidebar": sidebarGradient,
  "--theme-gradient-badge": badgeGradient,
  "--theme-gradient-icon": iconGradient,
  "--theme-focus-border": focusBorder,
  "--theme-ghost-hover": ghostHover,
  "--theme-ghost-border": ghostBorder,
  "--theme-ring": toRgba(primaryHex, 0.35),
  "--theme-shadow-primary": shadowPrimary,
} satisfies Record<string, string>;

export const themeStyleVars = themeVariables as CSSProperties;
