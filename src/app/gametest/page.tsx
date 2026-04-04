'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GazeEngine, type ColumnRefs, type GazeZone, type GazeState } from '@/lib/gametest/gazeEngine';
import { getTier, getScrollSpeed, getFilter, getGridTemplate } from '@/lib/gametest/slopEngine';
import { getImagesUpToTier } from '@/lib/gametest/imageData';
import { WORD_COUNT } from '@/lib/gametest/articleContent';
import { QUIZ_QUESTIONS } from '@/lib/gametest/quizContent';
import { generateReport, type SessionData, type ReportData } from '@/lib/gametest/reportGenerator';
import TwitterFeed from '@/components/gametest/TwitterFeed';
import InstagramFeed from '@/components/gametest/InstagramFeed';
import YouTubeFeed from '@/components/gametest/YouTubeFeed';
import TikTokFeed from '@/components/gametest/TikTokFeed';
import ArticleColumn from '@/components/gametest/ArticleColumn';
import QuizSection from '@/components/gametest/QuizSection';
import ReportSection from '@/components/gametest/ReportSection';
import CameraPermission from '@/components/gametest/CameraPermission';
import EyeTracker from '@/components/gametest/EyeTracker';

declare const webgazer: { begin: () => Promise<unknown>; setGazeListener: (cb: (data: { x: number; y: number } | null) => void) => unknown; pause: () => void; resume: () => void; end: () => void; params: { showVideoPreview: boolean }; [key: string]: unknown };

type Phase = 'landing' | 'camera_permission' | 'calibrating' | 'testing' | 'quiz' | 'report';

const CALIBRATION_POINTS = [
  { x: '10%', y: '10%' },
  { x: '90%', y: '10%' },
  { x: '50%', y: '50%' },
  { x: '10%', y: '90%' },
  { x: '90%', y: '90%' },
];

export default function GameTestPage() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [eyeTrackingEnabled, setEyeTrackingEnabled] = useState(false);
  const [calibrationIndex, setCalibrationIndex] = useState(0);
  const [tier, setTier] = useState(0);
  const [featured, setFeatured] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);

  const gazeEngine = useMemo(() => new GazeEngine(), []);
  const sessionStart = useRef<number>(0);
  const scrollProgressLog = useRef<number[]>([]);

  const leftOuterRef = useRef<HTMLDivElement>(null);
  const leftInnerRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const rightInnerRef = useRef<HTMLDivElement>(null);
  const rightOuterRef = useRef<HTMLDivElement>(null);

  const columnRefs: ColumnRefs = {
    leftOuter: leftOuterRef.current,
    leftInner: leftInnerRef.current,
    article: articleRef.current,
    rightInner: rightInnerRef.current,
    rightOuter: rightOuterRef.current,
  };

  // Fetch image list on mount
  useEffect(() => {
    fetch('/api/gametest-images')
      .then((res) => res.json())
      .then((data) => setAllImages(data.images || []))
      .catch(() => setAllImages([]));
  }, []);

  // Images for current tier
  const tierImages = useMemo(() => getImagesUpToTier(tier, allImages), [tier, allImages]);

  const scrollSpeed = getScrollSpeed(tier);
  const filter = getFilter(tier);
  const gridTemplate = getGridTemplate(featured);

  // Scroll tracking
  useEffect(() => {
    if (phase !== 'testing' && phase !== 'quiz') return;
    const handleScroll = () => {
      const progress = window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const newTier = getTier(progress);
      setTier(newTier);
      scrollProgressLog.current.push(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [phase]);

  const getScrollPct = useCallback(() => {
    return window.scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  }, []);

  // Gaze state change handler
  useEffect(() => {
    gazeEngine.setOnStateChange((state: GazeState, zone: GazeZone) => {
      if (state === 'distracted' && zone !== 'article' && zone !== 'outside') {
        setFeatured(zone);
      } else if (state === 'reading') {
        setFeatured(null);
      }
    });
  }, [gazeEngine]);

  // Hover-based distraction detection (always active as secondary)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleColumnEnter = useCallback((zone: GazeZone) => {
    if (zone === 'article' || zone === 'outside') {
      // Returning to article
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
      returnTimerRef.current = setTimeout(() => {
        setFeatured(null);
        gazeEngine.processGaze(
          window.innerWidth / 2,
          window.innerHeight / 2
        );
      }, 600);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      return;
    }

    // Entering distraction zone
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setFeatured(zone);
      // Feed gaze engine a point in the distraction column
      const el = {
        leftOuter: leftOuterRef.current,
        leftInner: leftInnerRef.current,
        rightInner: rightInnerRef.current,
        rightOuter: rightOuterRef.current,
      }[zone];
      if (el) {
        const rect = el.getBoundingClientRect();
        gazeEngine.processGaze(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }, 800);
  }, [gazeEngine]);

  const handleColumnLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  // Camera permission handlers
  const handleEnableCamera = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      if (typeof webgazer !== 'undefined') {
        await webgazer.begin();
        setEyeTrackingEnabled(true);
        setPhase('calibrating');
      } else {
        setPhase('testing');
        sessionStart.current = Date.now();
      }
    } catch {
      setPhase('testing');
      sessionStart.current = Date.now();
    }
  }, []);

  const handleSkipCamera = useCallback(() => {
    setPhase('testing');
    sessionStart.current = Date.now();
  }, []);

  // Calibration
  const handleCalibrationClick = useCallback((index: number) => {
    if (typeof webgazer !== 'undefined') {
      const pt = CALIBRATION_POINTS[index];
      const x = (parseFloat(pt.x) / 100) * window.innerWidth;
      const y = (parseFloat(pt.y) / 100) * window.innerHeight;
      webgazer.recordScreenPosition(x, y, 'click');
    }
    if (index >= CALIBRATION_POINTS.length - 1) {
      if (typeof webgazer !== 'undefined') {
        try {
          webgazer.showVideoPreview(false);
        } catch { /* ignore */ }
      }
      setPhase('testing');
      sessionStart.current = Date.now();
    } else {
      setCalibrationIndex(index + 1);
    }
  }, []);

  // Quiz submission
  const handleQuizSubmit = useCallback((answers: number[]) => {
    gazeEngine.finalize();

    const sessionData: SessionData = {
      startTime: sessionStart.current,
      endTime: Date.now(),
      distractionEvents: gazeEngine.getDistractionEvents(),
      gazeLog: gazeEngine.getGazeLog(),
      answers,
      wordCount: WORD_COUNT,
      scrollProgress: scrollProgressLog.current,
    };

    const correctAnswers = QUIZ_QUESTIONS.map((q) => q.correctIndex);
    const reportData = generateReport(sessionData, correctAnswers);
    setReport(reportData);
    setPhase('report');

    try {
      localStorage.setItem('gametest-session', JSON.stringify(sessionData));
      localStorage.setItem('gametest-report', JSON.stringify(reportData));
    } catch { /* localStorage may be full */ }
  }, [gazeEngine]);

  // ── RENDER PHASES ──

  if (phase === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Courier New", Courier, monospace',
        color: '#fff',
        padding: '2em',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#555', marginBottom: '2em' }}>
            COGNITIVE PERFORMANCE ASSESSMENT AND READABILITY INDEX
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            fontWeight: 400,
            marginBottom: '0.5em',
            letterSpacing: '-0.01em',
          }}>
            ATTENTION TEST
          </h1>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7, marginBottom: '3em' }}>
            A Cognitive Performance Assessment
          </p>
          <div style={{ fontSize: '11px', color: '#444', marginBottom: '2em', lineHeight: 1.8 }}>
            <div>&bull; Camera access optional for eye tracking</div>
            <div>&bull; 1 reading passage (~3,500 words)</div>
            <div>&bull; 10 comprehension questions</div>
            <div>&bull; Statistical performance report</div>
          </div>
          <button
            onClick={() => setPhase('camera_permission')}
            style={{
              padding: '14px 48px',
              background: '#fff',
              color: '#0a0a0a',
              border: 'none',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#14ff00'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
          >
            BEGIN READING TEST
          </button>
          <div style={{ marginTop: '3em', fontSize: '9px', color: '#333', letterSpacing: '0.1em' }}>
            ISO 23411-7:2019 &middot; ASTM F3342-22 &middot; CPARI Protocol v4.1.2
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'camera_permission') {
    return <CameraPermission onEnable={handleEnableCamera} onSkip={handleSkipCamera} />;
  }

  if (phase === 'calibrating') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a0a',
        zIndex: 50,
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontFamily: '"Courier New", monospace',
          fontSize: '13px',
          textAlign: 'center',
        }}>
          Click each dot to calibrate eye tracking ({calibrationIndex + 1}/{CALIBRATION_POINTS.length})
        </div>
        {CALIBRATION_POINTS.map((pt, i) => (
          <button
            key={i}
            onClick={() => handleCalibrationClick(i)}
            disabled={i !== calibrationIndex}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y,
              transform: 'translate(-50%, -50%)',
              width: i === calibrationIndex ? '24px' : '16px',
              height: i === calibrationIndex ? '24px' : '16px',
              borderRadius: '50%',
              background: i < calibrationIndex ? '#14ff00' : i === calibrationIndex ? '#fff' : '#333',
              border: 'none',
              cursor: i === calibrationIndex ? 'pointer' : 'default',
              transition: 'all 0.3s',
              padding: 0,
            }}
          />
        ))}
      </div>
    );
  }

  // Testing, Quiz, Report — all use the 5-column layout
  const isTesting = phase === 'testing' || phase === 'quiz' || phase === 'report';
  const feedsActive = phase === 'testing' || phase === 'quiz';

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <EyeTracker
        active={eyeTrackingEnabled && isTesting}
        columnRefs={columnRefs}
        gazeEngine={gazeEngine}
        scrollPctFn={getScrollPct}
      />

      {/* 5-column grid */}
      <div
        className={`slop-tier-${tier}`}
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          minHeight: '100vh',
          transition: 'grid-template-columns 400ms ease',
        }}
      >
        {/* Left outer: Twitter */}
        <div
          ref={leftOuterRef}
          className="feed-col-wrapper"
          onMouseEnter={() => handleColumnEnter('leftOuter')}
          onMouseLeave={handleColumnLeave}
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflow: 'hidden',
            filter: filter !== 'none' ? filter : undefined,
            transition: 'filter 0.4s ease',
          }}
        >
          {feedsActive && (
            <TwitterFeed tier={tier} images={tierImages} scrollSpeed={scrollSpeed} />
          )}
        </div>

        {/* Left inner: Instagram */}
        <div
          ref={leftInnerRef}
          className="feed-col-wrapper"
          onMouseEnter={() => handleColumnEnter('leftInner')}
          onMouseLeave={handleColumnLeave}
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflow: 'hidden',
            filter: filter !== 'none' ? filter : undefined,
            transition: 'filter 0.4s ease',
          }}
        >
          {feedsActive && (
            <InstagramFeed tier={tier} images={tierImages} scrollSpeed={scrollSpeed} />
          )}
        </div>

        {/* Center: Article + Quiz + Report */}
        <div
          ref={articleRef}
          onMouseEnter={() => handleColumnEnter('article')}
          onMouseLeave={handleColumnLeave}
          style={{ minHeight: '100vh' }}
        >
          <ArticleColumn isShrunk={featured !== null} />

          {(phase === 'quiz' || phase === 'report') && (
            <QuizSection onSubmit={handleQuizSubmit} />
          )}

          {phase === 'report' && report && (
            <ReportSection report={report} />
          )}

          {/* Trigger quiz at bottom of article */}
          {phase === 'testing' && (
            <div style={{
              padding: '48px 32px',
              textAlign: 'center',
            }}>
              <button
                onClick={() => setPhase('quiz')}
                style={{
                  padding: '14px 48px',
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                PROCEED TO ASSESSMENT
              </button>
            </div>
          )}
        </div>

        {/* Right inner: YouTube */}
        <div
          ref={rightInnerRef}
          className="feed-col-wrapper"
          onMouseEnter={() => handleColumnEnter('rightInner')}
          onMouseLeave={handleColumnLeave}
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflow: 'hidden',
            filter: filter !== 'none' ? filter : undefined,
            transition: 'filter 0.4s ease',
          }}
        >
          {feedsActive && (
            <YouTubeFeed tier={tier} images={tierImages} scrollSpeed={scrollSpeed} />
          )}
        </div>

        {/* Right outer: TikTok */}
        <div
          ref={rightOuterRef}
          className="feed-col-wrapper"
          onMouseEnter={() => handleColumnEnter('rightOuter')}
          onMouseLeave={handleColumnLeave}
          style={{
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflow: 'hidden',
            filter: filter !== 'none' ? filter : undefined,
            transition: 'filter 0.4s ease',
          }}
        >
          {feedsActive && (
            <TikTokFeed tier={tier} images={tierImages} scrollSpeed={scrollSpeed} />
          )}
        </div>
      </div>
    </div>
  );
}
