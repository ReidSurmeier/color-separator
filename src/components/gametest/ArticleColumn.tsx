'use client';

import { forwardRef } from 'react';
import { ARTICLE_TITLE, ARTICLE_SUBTITLE, ARTICLE_AUTHOR, ARTICLE_DATE, ARTICLE_PARAGRAPHS } from '@/lib/gametest/articleContent';

interface ArticleColumnProps {
  isShrunk: boolean;
}

const ArticleColumn = forwardRef<HTMLDivElement, ArticleColumnProps>(
  function ArticleColumn({ isShrunk }, ref) {
    return (
      <div
        ref={ref}
        style={{
          height: '100%',
          overflowY: 'visible',
          background: '#fff',
        }}
      >
        {/* Header bar */}
        <div style={{
          padding: '6px 16px',
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '11px',
          color: '#999',
          background: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          letterSpacing: '0.02em',
        }}>
          SampleContent/Xanadoc/MoeJuste/1-zxcvb.xanadoc
        </div>

        <div style={{
          padding: isShrunk ? '16px 12px' : '40px 48px',
          maxWidth: isShrunk ? '100%' : '65ch',
          margin: '0 auto',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: isShrunk ? '13px' : '16px',
          lineHeight: 1.7,
          color: '#333',
          transition: 'padding 0.4s ease, font-size 0.4s ease, max-width 0.4s ease',
        }}>
          <header style={{ marginBottom: '2em' }}>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: isShrunk ? '1.1em' : '1.8em',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '0.3em',
              color: '#111',
              transition: 'font-size 0.4s ease',
            }}>
              {ARTICLE_TITLE}
            </h1>
            <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '0.5em', fontSize: '0.9em' }}>
              {ARTICLE_SUBTITLE}
            </p>
            <p style={{ color: '#999', fontSize: '0.8em', fontFamily: 'system-ui, sans-serif' }}>
              {ARTICLE_AUTHOR} &middot; {ARTICLE_DATE}
            </p>
          </header>

          {ARTICLE_PARAGRAPHS.map((para, i) => (
            <p
              key={i}
              style={{
                marginBottom: '1.4em',
                textAlign: 'left',
                background: i === 0 ? '#FFD54F' : 'transparent',
                padding: i === 0 ? '4px 2px' : '0',
              }}
            >
              {para}
            </p>
          ))}

          <footer style={{ marginTop: '3em', paddingTop: '1em', borderTop: '1px solid #e0e0e0' }}>
            <p style={{ color: '#999', fontSize: '0.75em', fontFamily: 'system-ui, sans-serif' }}>
              Originally published on{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'underline' }}>Pluralistic</a>.
              Reproduced under fair use for educational research purposes.
            </p>
          </footer>
        </div>
      </div>
    );
  }
);

export default ArticleColumn;
