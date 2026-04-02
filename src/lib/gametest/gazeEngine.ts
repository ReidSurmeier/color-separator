export type GazeZone = 'leftOuter' | 'leftInner' | 'article' | 'rightInner' | 'rightOuter' | 'outside';
export type GazeState = 'reading' | 'distracted';

export interface GazeEvent {
  t: number;
  zone: GazeZone;
  x: number;
  y: number;
}

export interface DistractionEvent {
  start: number;
  end: number;
  column: string;
  scrollPct: number;
}

export interface ColumnRefs {
  leftOuter: HTMLElement | null;
  leftInner: HTMLElement | null;
  article: HTMLElement | null;
  rightInner: HTMLElement | null;
  rightOuter: HTMLElement | null;
}

const DISTRACTION_DWELL_MS = 800;
const RETURN_DWELL_MS = 600;

export class GazeEngine {
  private state: GazeState = 'reading';
  private currentZone: GazeZone = 'article';
  private zoneEnteredAt: number = Date.now();
  private columnRefs: ColumnRefs = {
    leftOuter: null,
    leftInner: null,
    article: null,
    rightInner: null,
    rightOuter: null,
  };
  private gazeLog: GazeEvent[] = [];
  private distractionEvents: DistractionEvent[] = [];
  private currentDistraction: { start: number; column: string; scrollPct: number } | null = null;
  private onStateChange: ((state: GazeState, zone: GazeZone) => void) | null = null;
  private scrollPctFn: (() => number) | null = null;

  setColumnRefs(refs: ColumnRefs) {
    this.columnRefs = refs;
  }

  setOnStateChange(cb: (state: GazeState, zone: GazeZone) => void) {
    this.onStateChange = cb;
  }

  setScrollPctFn(fn: () => number) {
    this.scrollPctFn = fn;
  }

  detectZone(x: number, y: number): GazeZone {
    const zones: [GazeZone, HTMLElement | null][] = [
      ['leftOuter', this.columnRefs.leftOuter],
      ['leftInner', this.columnRefs.leftInner],
      ['article', this.columnRefs.article],
      ['rightInner', this.columnRefs.rightInner],
      ['rightOuter', this.columnRefs.rightOuter],
    ];

    for (const [name, el] of zones) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return name;
      }
    }
    return 'outside';
  }

  processGaze(x: number, y: number) {
    const now = Date.now();
    const zone = this.detectZone(x, y);

    this.gazeLog.push({ t: now, zone, x, y });

    if (zone !== this.currentZone) {
      this.currentZone = zone;
      this.zoneEnteredAt = now;
    }

    const dwellTime = now - this.zoneEnteredAt;
    const isArticleZone = zone === 'article';
    const isDistractionZone = zone !== 'article' && zone !== 'outside';

    if (this.state === 'reading' && isDistractionZone && dwellTime >= DISTRACTION_DWELL_MS) {
      this.state = 'distracted';
      this.currentDistraction = {
        start: now,
        column: zone,
        scrollPct: this.scrollPctFn?.() ?? 0,
      };
      this.onStateChange?.('distracted', zone);
    } else if (this.state === 'distracted' && isArticleZone && dwellTime >= RETURN_DWELL_MS) {
      this.state = 'reading';
      if (this.currentDistraction) {
        this.distractionEvents.push({
          ...this.currentDistraction,
          end: now,
        });
        this.currentDistraction = null;
      }
      this.onStateChange?.('reading', zone);
    }
  }

  getState(): GazeState {
    return this.state;
  }

  getCurrentZone(): GazeZone {
    return this.currentZone;
  }

  getGazeLog(): GazeEvent[] {
    return this.gazeLog;
  }

  getDistractionEvents(): DistractionEvent[] {
    // Include current ongoing distraction
    if (this.currentDistraction) {
      return [
        ...this.distractionEvents,
        { ...this.currentDistraction, end: Date.now() },
      ];
    }
    return this.distractionEvents;
  }

  finalize() {
    if (this.currentDistraction) {
      this.distractionEvents.push({
        ...this.currentDistraction,
        end: Date.now(),
      });
      this.currentDistraction = null;
    }
  }

  reset() {
    this.state = 'reading';
    this.currentZone = 'article';
    this.zoneEnteredAt = Date.now();
    this.gazeLog = [];
    this.distractionEvents = [];
    this.currentDistraction = null;
  }
}
