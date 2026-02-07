// ANSI escape codes for colors
// Matching oh-my-pi dark theme colors exactly

export interface AnsiColors {
  getBgAnsi(r: number, g: number, b: number): string;
  getFgAnsi(r: number, g: number, b: number): string;
  getFgAnsi256(code: number): string;
  reset: string;
}

export const ansi: AnsiColors = {
  getBgAnsi: (r, g, b) => `\x1b[48;2;${r};${g};${b}m`,
  getFgAnsi: (r, g, b) => `\x1b[38;2;${r};${g};${b}m`,
  getFgAnsi256: (code) => `\x1b[38;5;${code}m`,
  reset: "\x1b[0m",
};

// Convert hex to RGB tuple
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// Evangelion terminal-inspired colors (orange + neon green on dark)
const THEME = {
  // Status line colors
  sep: "#ff6a00",                     // Bright orange separators/borders
  model: "#ff7a00",                   // Orange
  path: "#5fffb3",                    // Neon mint green
  gitClean: "#7dff9a",                // Bright green
  gitDirty: "#ff9c1a",                // Amber orange
  context: "#49f2a5",                 // Mint green
  spend: "#ffb347",                   // Soft amber
  staged: "#7dff9a",                  // Bright green
  unstaged: "#ff9c1a",                // Amber orange
  untracked: "#49f2a5",               // Mint green
  output: "#ff8c1a",                  // Orange
  cost: "#ff8c1a",                    // Orange
  subagents: "#ffb347",               // Accent amber

  // UI colors
  accent: "#ff8c1a",                  // Main orange accent
  border: "#ff6a00",                  // Orange border
  warning: "#ffb347",                 // Amber warning
  error: "#ff3b30",                   // Red alert
  text: "",                           // Default terminal color

  // Thinking level colors (warm -> vivid)
  thinkingOff: "#4a3322",             // Deep brown dim
  thinkingMinimal: "#7a4a20",         // Dim orange
  thinkingLow: "#ff7a00",             // Orange
  thinkingMedium: "#ff9c1a",          // Bright amber
  thinkingHigh: "#5fffb3",            // Neon mint
  thinkingXhigh: "#7dff9a",           // Bright green
};

// Color name to ANSI code mapping
type ColorName = 
  | "sep" | "model" | "path" | "gitClean" | "gitDirty" 
  | "context" | "spend" | "staged" | "unstaged" | "untracked"
  | "output" | "cost" | "subagents" | "accent" | "border"
  | "warning" | "error" | "text"
  | "thinkingOff" | "thinkingMinimal" | "thinkingLow" 
  | "thinkingMedium" | "thinkingHigh" | "thinkingXhigh";

function getAnsiCode(color: ColorName): string {
  const value = THEME[color as keyof typeof THEME];
  
  if (value === undefined || value === "") {
    return ""; // No color, use terminal default
  }
  
  if (typeof value === "number") {
    return ansi.getFgAnsi256(value);
  }
  
  if (typeof value === "string" && value.startsWith("#")) {
    const [r, g, b] = hexToRgb(value);
    return ansi.getFgAnsi(r, g, b);
  }
  
  return "";
}

// Helper to apply foreground color only (no reset - caller manages reset)
export function fgOnly(color: ColorName, text: string): string {
  const code = getAnsiCode(color);
  return code ? `${code}${text}` : text;
}

// Get raw ANSI code for a color
export function getFgAnsiCode(color: ColorName): string {
  return getAnsiCode(color);
}

// Evangelion gradient for ultra/xhigh thinking
const RAINBOW_COLORS = [
  "#ff6a00",  // orange
  "#ff8c1a",  // bright orange
  "#ffb347",  // amber
  "#7dff9a",  // bright green
  "#5fffb3",  // mint
  "#49f2a5",  // mint green
  "#ff9c1a",  // amber orange
  "#ff6a00",  // orange (loop)
];

// Apply rainbow gradient to text (each character gets next color)
export function rainbow(text: string): string {
  let result = "";
  let colorIndex = 0;
  for (const char of text) {
    if (char === " " || char === ":") {
      result += char;
    } else {
      const [r, g, b] = hexToRgb(RAINBOW_COLORS[colorIndex % RAINBOW_COLORS.length]);
      result += `${ansi.getFgAnsi(r, g, b)}${char}`;
      colorIndex++;
    }
  }
  return result + ansi.reset;
}
