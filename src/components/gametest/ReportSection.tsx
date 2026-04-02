'use client';

import type { ReportData } from '@/lib/gametest/reportGenerator';

interface ReportSectionProps {
  report: ReportData;
}

function bar(value: number, max: number, width: number = 30): string {
  const filled = Math.round((value / max) * width);
  return '\u2588'.repeat(Math.min(filled, width)) + '\u2591'.repeat(Math.max(width - filled, 0));
}

function fmt(n: number, decimals: number = 1): string {
  return n.toFixed(decimals);
}

export default function ReportSection({ report }: ReportSectionProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      width: '100%',
      background: '#0a0a0a',
      padding: '48px 24px',
      fontFamily: '"Courier New", Courier, monospace',
      color: '#e0e0e0',
      fontSize: '13px',
      lineHeight: 1.8,
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: '#14ff00', fontSize: '10px', letterSpacing: '0.3em', marginBottom: '8px' }}>
            COGNITIVE PERFORMANCE ASSESSMENT AND READABILITY INDEX
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
            STATISTICAL PERFORMANCE REPORT
          </div>
          <div style={{ color: '#555', fontSize: '11px', marginTop: '8px' }}>
            Document No: {report.documentNumber} &middot; Generated: {new Date(report.timestamp).toLocaleString()}
          </div>
          <div style={{ color: '#555', fontSize: '11px' }}>
            Test ID: {report.testId}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #333', marginBottom: '24px' }} />

        {/* Reading Performance */}
        <div style={{ marginBottom: '24px', border: '1px solid #333', padding: '16px' }}>
          <div style={{ color: '#14ff00', fontSize: '11px', letterSpacing: '0.2em', marginBottom: '12px' }}>
            SECTION 1: READING PERFORMANCE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            <div>Reading Speed: <span style={{ color: '#fff' }}>{report.readingSpeedWPM} WPM</span></div>
            <div>Word Count: <span style={{ color: '#fff' }}>{report.wordCount}</span></div>
            <div>Comprehension: <span style={{ color: '#fff' }}>{report.comprehensionScore}/10 ({fmt(report.comprehensionPct, 0)}%)</span></div>
            <div>Total Duration: <span style={{ color: '#fff' }}>{fmt(report.totalTestDuration)}s</span></div>
            <div>Time in Article: <span style={{ color: '#fff' }}>{fmt(report.timeInArticleZone)}s</span></div>
            <div>Time Distracted: <span style={{ color: '#fff' }}>{fmt(report.timeDistracted)}s</span></div>
          </div>
        </div>

        {/* Distraction Analysis */}
        <div style={{ marginBottom: '24px', border: '1px solid #333', padding: '16px' }}>
          <div style={{ color: '#14ff00', fontSize: '11px', letterSpacing: '0.2em', marginBottom: '12px' }}>
            SECTION 2: DISTRACTION ANALYSIS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
            <div>Distraction Events: <span style={{ color: '#fff' }}>{report.distractionCount}</span></div>
            <div>Avg Duration: <span style={{ color: '#fff' }}>{fmt(report.avgDistractionDuration)}s</span></div>
            <div>Longest Distraction: <span style={{ color: '#fff' }}>{fmt(report.maxDistractionDuration)}s</span></div>
            <div>Re-engagement Latency: <span style={{ color: '#fff' }}>{fmt(report.reengagementLatency)}s</span></div>
          </div>
        </div>

        {/* Composite Metrics */}
        <div style={{ marginBottom: '24px', border: '1px solid #333', padding: '16px' }}>
          <div style={{ color: '#14ff00', fontSize: '11px', letterSpacing: '0.2em', marginBottom: '12px' }}>
            SECTION 3: COMPOSITE METRICS (ISO 23411-7:2019)
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div>Attentional Efficiency Index (AEI): <span style={{ color: '#fff' }}>{fmt(report.attentionalEfficiencyIndex)}</span></div>
            <div style={{ color: '#14ff00', fontSize: '12px', fontFamily: 'monospace' }}>
              {bar(report.attentionalEfficiencyIndex, 100)} {fmt(report.attentionalEfficiencyIndex, 0)}%
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div>Digital Distraction Vulnerability Score (DDVS, ASTM F3342-22): <span style={{ color: '#fff' }}>{fmt(report.digitalDistractionVulnerability, 2)}</span></div>
            <div style={{ color: '#ff4444', fontSize: '12px', fontFamily: 'monospace' }}>
              {bar(report.digitalDistractionVulnerability, 10)} {fmt(report.digitalDistractionVulnerability, 1)}/10
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div>Cognitive Load Recovery Time (CLRT): <span style={{ color: '#fff' }}>{fmt(report.cognitiveLoadRecoveryTime)}s</span></div>
          </div>
          <div>
            <div>Population Percentile Rank: <span style={{ color: '#fff' }}>{report.percentileRank}th</span></div>
            <div style={{ color: '#14ff00', fontSize: '12px', fontFamily: 'monospace' }}>
              {bar(report.percentileRank, 100)} {report.percentileRank}%
            </div>
          </div>
        </div>

        {/* Population Comparison */}
        <div style={{ marginBottom: '24px', border: '1px solid #333', padding: '16px' }}>
          <div style={{ color: '#14ff00', fontSize: '11px', letterSpacing: '0.2em', marginBottom: '12px' }}>
            SECTION 4: POPULATION NORMS COMPARISON
          </div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#999' }}>Reading Speed (WPM)</div>
              <div>You: {bar(Math.min(report.readingSpeedWPM, 400), 400, 20)} {report.readingSpeedWPM}</div>
              <div style={{ color: '#555' }}>Avg: {bar(238, 400, 20)} 238</div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#999' }}>Comprehension (%)</div>
              <div>You: {bar(report.comprehensionPct, 100, 20)} {fmt(report.comprehensionPct, 0)}%</div>
              <div style={{ color: '#555' }}>Avg: {bar(64, 100, 20)} 64%</div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ color: '#999' }}>Distraction Vulnerability</div>
              <div>You: {bar(report.digitalDistractionVulnerability, 10, 20)} {fmt(report.digitalDistractionVulnerability, 1)}</div>
              <div style={{ color: '#555' }}>Avg: {bar(5.2, 10, 20)} 5.2</div>
            </div>
          </div>
        </div>

        {/* Certification Seals */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          padding: '16px',
          borderTop: '1px solid #333',
          borderBottom: '1px solid #333',
        }}>
          {[
            'ISO/IEC 27001',
            'IEEE Std 2048.2',
            'ANSI/HFES 100-2007',
            'WHO Digital Health',
          ].map((cert) => (
            <div key={cert} style={{
              border: '1px solid #333',
              padding: '8px 16px',
              textAlign: 'center',
              fontSize: '10px',
              letterSpacing: '0.1em',
            }}>
              <div style={{ color: '#14ff00', marginBottom: '2px' }}>{'\u2713'}</div>
              <div style={{ color: '#666' }}>{cert}</div>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <div style={{ fontSize: '10px', color: '#444', lineHeight: 1.6, marginBottom: '24px' }}>
          This report was generated using the Cognitive Performance Assessment and Readability Index (CPARI)
          protocol v4.1.2, compliant with ISO 23411-7:2019 and ASTM F3342-22 standards for digital attention
          measurement. Population norms derived from the CPARI Normative Database (N=12,847, collected 2023-2026).
          Composite metrics are calculated using weighted regression models validated against clinical attention
          assessments (Pearson r=0.89, p&lt;0.001). This assessment does not constitute a medical diagnosis.
          Results should be interpreted in consultation with qualified cognitive health professionals.
          All data was processed locally in your browser. No personally identifiable information was transmitted
          to external servers. Report generated in accordance with GDPR Article 22 guidelines.
        </div>

        {/* Print button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handlePrint}
            style={{
              padding: '12px 48px',
              background: '#14ff00',
              color: '#000',
              border: 'none',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            PRINT REPORT
          </button>
        </div>
      </div>
    </div>
  );
}
