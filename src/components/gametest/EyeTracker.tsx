'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GazeEngine, type ColumnRefs } from '@/lib/gametest/gazeEngine';

declare const webgazer: { begin: () => Promise<unknown>; setGazeListener: (cb: (data: { x: number; y: number } | null) => void) => unknown; pause: () => void; resume: () => void; end: () => void; params: { showVideoPreview: boolean }; [key: string]: unknown };

interface EyeTrackerProps {
  active: boolean;
  columnRefs: ColumnRefs;
  gazeEngine: GazeEngine;
  scrollPctFn: () => number;
}

export default function EyeTracker({ active, columnRefs, gazeEngine, scrollPctFn }: EyeTrackerProps) {
  const initialized = useRef(false);
  const listenerSet = useRef(false);

  const gazeCallback = useCallback(
    (data: { x: number; y: number } | null) => {
      if (!data) return;
      gazeEngine.processGaze(data.x, data.y);
    },
    [gazeEngine]
  );

  useEffect(() => {
    gazeEngine.setColumnRefs(columnRefs);
  }, [gazeEngine, columnRefs]);

  useEffect(() => {
    gazeEngine.setScrollPctFn(scrollPctFn);
  }, [gazeEngine, scrollPctFn]);

  useEffect(() => {
    if (!active || initialized.current) return;
    if (typeof webgazer === 'undefined') return;

    initialized.current = true;

    try {
      webgazer.showVideoPreview(false);
      webgazer.showPredictionPoints(false);
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);
    } catch {
      // Some methods may not exist in all versions
    }

    if (!listenerSet.current) {
      webgazer.setGazeListener(gazeCallback);
      listenerSet.current = true;
    }
  }, [active, gazeCallback]);

  return null;
}
