export function getTier(scrollProgress: number): number {
  if (scrollProgress < 0.2) return 0;
  if (scrollProgress < 0.4) return 1;
  if (scrollProgress < 0.6) return 2;
  if (scrollProgress < 0.8) return 3;
  return 4;
}

export function getScrollSpeed(tier: number): number {
  return [80, 50, 30, 15, 6][tier] || 80;
}

export function getFilter(tier: number): string {
  return [
    'none',
    'none',
    'contrast(1.1) saturate(1.15)',
    'contrast(1.25) saturate(1.4)',
    'contrast(1.5) saturate(1.9) brightness(1.05)',
  ][tier] || 'none';
}

export function getGridTemplate(featured: string | null): string {
  if (!featured) return '15% 15% 40% 15% 15%';
  const templates: Record<string, string> = {
    leftOuter: '45% 8% 20% 14% 13%',
    leftInner: '8% 45% 20% 14% 13%',
    rightInner: '13% 14% 20% 45% 8%',
    rightOuter: '13% 14% 20% 8% 45%',
  };
  return templates[featured] || '15% 15% 40% 15% 15%';
}
