import type { PrintColor } from "./types";

export const PRINT_COLORS: PrintColor[] = [
  // Traditional woodblock
  { name: "sumi black", rgb: [35, 30, 30], category: "woodblock" },
  { name: "vermillion", rgb: [207, 62, 52], category: "woodblock" },
  { name: "indigo", rgb: [50, 60, 115], category: "woodblock" },
  { name: "yellow ochre", rgb: [204, 165, 60], category: "woodblock" },
  { name: "celadon green", rgb: [112, 168, 130], category: "woodblock" },

  // Screen printing basics
  { name: "process cyan", rgb: [0, 170, 228], category: "screenprint" },
  { name: "magenta", rgb: [215, 0, 110], category: "screenprint" },
  { name: "yellow", rgb: [255, 225, 0], category: "screenprint" },
  { name: "black", rgb: [0, 0, 0], category: "screenprint" },
  { name: "white", rgb: [255, 255, 255], category: "screenprint" },

  // Riso-inspired
  { name: "fluorescent pink", rgb: [255, 72, 176], category: "riso" },
  { name: "fluorescent orange", rgb: [255, 108, 47], category: "riso" },
  { name: "aqua", rgb: [94, 200, 229], category: "riso" },
  { name: "cornflower", rgb: [98, 168, 229], category: "riso" },
  { name: "mint", rgb: [130, 216, 168], category: "riso" },
  { name: "scarlet", rgb: [229, 72, 72], category: "riso" },
  { name: "purple", rgb: [118, 91, 167], category: "riso" },
];

export function rgbToHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb.map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
