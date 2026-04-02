export interface TierConfig {
  tier: number;
  label: string;
  carouselSpeed: number; // seconds per image
  filter: string;
}

export const TIER_CONFIGS: TierConfig[] = [
  { tier: 0, label: 'Early Internet', carouselSpeed: 6, filter: 'none' },
  { tier: 1, label: 'GIF Era', carouselSpeed: 4, filter: 'contrast(1.05) saturate(1.1)' },
  { tier: 2, label: 'Tumblr/Crypto', carouselSpeed: 2.5, filter: 'contrast(1.1) saturate(1.2)' },
  { tier: 3, label: 'YouTube Slop', carouselSpeed: 1.5, filter: 'contrast(1.3) saturate(1.5)' },
  { tier: 4, label: 'Full Chaos', carouselSpeed: 0.7, filter: 'contrast(1.5) saturate(2) brightness(1.1)' },
];

// Build image pool from the 271 numbered files in public/images/gametest/
// Files are named like: 1_description.ext, 2_description.ext, etc.
// We'll generate the list at build time from known filenames.

const IMAGE_FILES: Record<number, string> = {};

// This will be populated dynamically from the filesystem at runtime.
// For SSR/client, we use a pre-built map.
// Images numbered 1-50: tier 0, 51-100: tier 1, 101-160: tier 2, 161-220: tier 3, 221-271: tier 4

export function getTierForImageNumber(num: number): number {
  if (num <= 50) return 0;
  if (num <= 100) return 1;
  if (num <= 160) return 2;
  if (num <= 220) return 3;
  return 4;
}

export function getTierForScrollProgress(progress: number): number {
  if (progress < 0.2) return 0;
  if (progress < 0.4) return 1;
  if (progress < 0.6) return 2;
  if (progress < 0.8) return 3;
  return 4;
}

// Pre-built image list - will be set from the actual filenames
let _imageList: string[] | null = null;

export function setImageList(files: string[]) {
  _imageList = files;
}

export function getImageList(): string[] {
  return _imageList || [];
}

export function getImagesForTier(tier: number, allImages: string[]): string[] {
  return allImages.filter((filename) => {
    const num = parseInt(filename.split('_')[0], 10);
    if (isNaN(num)) return false;
    return getTierForImageNumber(num) === tier;
  });
}

export function getImagesUpToTier(tier: number, allImages: string[]): string[] {
  return allImages.filter((filename) => {
    const num = parseInt(filename.split('_')[0], 10);
    if (isNaN(num)) return false;
    return getTierForImageNumber(num) <= tier;
  });
}
