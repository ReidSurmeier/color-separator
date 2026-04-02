import type { DistractionEvent, GazeEvent } from './gazeEngine';

export interface SessionData {
  startTime: number;
  endTime: number;
  distractionEvents: DistractionEvent[];
  gazeLog: GazeEvent[];
  answers: number[];
  wordCount: number;
  scrollProgress: number[];
}

export interface ReportData {
  // Timing
  totalTestDuration: number;
  timeInArticleZone: number;
  timeDistracted: number;

  // Reading
  readingSpeedWPM: number;
  wordCount: number;

  // Comprehension
  comprehensionScore: number;
  comprehensionPct: number;

  // Distraction
  distractionCount: number;
  avgDistractionDuration: number;
  maxDistractionDuration: number;
  reengagementLatency: number;

  // Fake metrics
  attentionalEfficiencyIndex: number;
  digitalDistractionVulnerability: number;
  cognitiveLoadRecoveryTime: number;
  percentileRank: number;

  // Meta
  documentNumber: string;
  testId: string;
  timestamp: string;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateReport(session: SessionData, correctAnswers: number[]): ReportData {
  const totalTestDuration = (session.endTime - session.startTime) / 1000;

  // Calculate time in article zone
  let timeInArticleZone = 0;
  let lastArticleStart: number | null = null;
  for (const event of session.gazeLog) {
    if (event.zone === 'article') {
      if (lastArticleStart === null) lastArticleStart = event.t;
    } else {
      if (lastArticleStart !== null) {
        timeInArticleZone += (event.t - lastArticleStart) / 1000;
        lastArticleStart = null;
      }
    }
  }
  if (lastArticleStart !== null) {
    timeInArticleZone += (Date.now() - lastArticleStart) / 1000;
  }
  // Minimum 30s to avoid division by zero
  timeInArticleZone = Math.max(timeInArticleZone, 30);

  // Distraction stats
  const distractions = session.distractionEvents;
  const distractionCount = distractions.length;
  const distractionDurations = distractions.map((d) => (d.end - d.start) / 1000);
  const totalDistracted = distractionDurations.reduce((a, b) => a + b, 0);
  const avgDistractionDuration = distractionCount > 0 ? totalDistracted / distractionCount : 0;
  const maxDistractionDuration = distractionCount > 0 ? Math.max(...distractionDurations) : 0;

  // Re-engagement latency (avg time between distraction end and next article gaze)
  let totalReengagement = 0;
  let reengagementCount = 0;
  for (const d of distractions) {
    const nextArticleGaze = session.gazeLog.find((g) => g.t > d.end && g.zone === 'article');
    if (nextArticleGaze) {
      totalReengagement += (nextArticleGaze.t - d.end) / 1000;
      reengagementCount++;
    }
  }
  const reengagementLatency = reengagementCount > 0 ? totalReengagement / reengagementCount : 0;

  // Reading speed
  const readingSpeedWPM = Math.round(session.wordCount / (timeInArticleZone / 60));

  // Comprehension
  let correctCount = 0;
  for (let i = 0; i < session.answers.length; i++) {
    if (session.answers[i] === correctAnswers[i]) correctCount++;
  }
  const comprehensionPct = (correctCount / correctAnswers.length) * 100;

  // Fake metrics - derived from real data but with official-sounding calculations
  const attentionalEfficiencyIndex = Math.min(
    99.9,
    Math.max(1, (timeInArticleZone / totalTestDuration) * 100 * (1 - distractionCount * 0.03))
  );

  const digitalDistractionVulnerability = Math.min(
    10,
    Math.max(0.1, (distractionCount * avgDistractionDuration) / (totalTestDuration * 0.1))
  );

  const cognitiveLoadRecoveryTime = reengagementLatency > 0 ? reengagementLatency : 1.2;

  // Percentile rank - make it seem plausible
  const rawScore = attentionalEfficiencyIndex * 0.4 + comprehensionPct * 0.4 + (10 - digitalDistractionVulnerability) * 2;
  const percentileRank = Math.min(99, Math.max(1, Math.round(rawScore)));

  const testId = generateUUID();

  return {
    totalTestDuration,
    timeInArticleZone,
    timeDistracted: totalDistracted,
    readingSpeedWPM,
    wordCount: session.wordCount,
    comprehensionScore: correctCount,
    comprehensionPct,
    distractionCount,
    avgDistractionDuration,
    maxDistractionDuration,
    reengagementLatency,
    attentionalEfficiencyIndex: Math.round(attentionalEfficiencyIndex * 10) / 10,
    digitalDistractionVulnerability: Math.round(digitalDistractionVulnerability * 100) / 100,
    cognitiveLoadRecoveryTime: Math.round(cognitiveLoadRecoveryTime * 100) / 100,
    percentileRank,
    documentNumber: `CPARI-2026-${testId.slice(0, 8).toUpperCase()}`,
    testId,
    timestamp: new Date().toISOString(),
  };
}
