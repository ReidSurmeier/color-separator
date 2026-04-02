'use client';

import { useMemo } from 'react';
import { YOUTUBE_VIDEOS, type YouTubeVideo } from '@/lib/gametest/feedContent';

interface YouTubeFeedProps {
  tier: number;
  images: string[];
  scrollSpeed: number;
}

export default function YouTubeFeed({ tier, images, scrollSpeed }: YouTubeFeedProps) {
  const videos = useMemo(() => {
    const tierVideos: YouTubeVideo[] = [];
    for (let t = 0; t <= tier; t++) {
      tierVideos.push(...YOUTUBE_VIDEOS[t]);
    }
    return tierVideos;
  }, [tier]);

  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        background: '#fff',
        position: 'relative',
      }}
    >
      <div
        className="feed-scroller"
        style={{ '--scroll-speed': `${scrollSpeed}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy}>
            {videos.map((video, i) => {
              const imgIndex = (copy * videos.length + i) % Math.max(images.length, 1);
              return (
                <div key={`${copy}-${i}`} style={{ padding: '8px 8px 16px', cursor: 'pointer' }}>
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#0f0f0f', borderRadius: '8px', overflow: 'hidden' }}>
                    {images.length > 0 && (
                      <img
                        src={`/images/gametest/${images[imgIndex]}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                    )}
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.8)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 500,
                      fontFamily: 'Roboto, system-ui, sans-serif',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      lineHeight: 1,
                    }}>
                      {video.duration}
                    </span>
                  </div>
                  {/* Info */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <img
                      src={`https://i.pravatar.cc/36?img=${(i + copy * 25 + 20) % 70}`}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, marginTop: '2px' }}
                      loading="lazy"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 500,
                        fontSize: '14px',
                        fontFamily: 'Roboto, system-ui, sans-serif',
                        color: '#0f0f0f',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '4px',
                      }}>
                        {video.title}
                      </div>
                      <div style={{ fontSize: '13px', fontFamily: 'Roboto, system-ui, sans-serif', color: '#606060', lineHeight: 1.4 }}>
                        {video.channel}
                      </div>
                      <div style={{ fontSize: '13px', fontFamily: 'Roboto, system-ui, sans-serif', color: '#606060' }}>
                        {video.views} &middot; {video.time}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
