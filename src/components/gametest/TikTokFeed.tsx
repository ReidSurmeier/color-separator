'use client';

import { useMemo } from 'react';
import { TIKTOK_POSTS, type TikTokPost } from '@/lib/gametest/feedContent';

interface TikTokFeedProps {
  tier: number;
  images: string[];
  scrollSpeed: number;
}

export default function TikTokFeed({ tier, images, scrollSpeed }: TikTokFeedProps) {
  const posts = useMemo(() => {
    const tierPosts: TikTokPost[] = [];
    for (let t = 0; t <= tier; t++) {
      tierPosts.push(...TIKTOK_POSTS[t]);
    }
    return tierPosts;
  }, [tier]);

  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      <div
        className="feed-scroller"
        style={{ '--scroll-speed': `${scrollSpeed}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy}>
            {posts.map((post, i) => {
              const imgIndex = (copy * posts.length + i) % Math.max(images.length, 1);
              return (
                <div
                  key={`${copy}-${i}`}
                  style={{
                    position: 'relative',
                    width: 'calc(100% - 8px)',
                    margin: '4px auto',
                    aspectRatio: '9/16',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: '#161616',
                  }}
                >
                  {/* Full bleed image */}
                  {images.length > 0 && (
                    <img
                      src={`/images/gametest/${images[imgIndex]}`}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  )}

                  {/* Top tab bar */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                  }}>
                    Following{'  '}<span style={{ color: '#fff' }}>For You</span>
                  </div>

                  {/* Bottom overlay: username + description */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: '48px',
                    padding: '16px 12px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', fontFamily: 'system-ui, sans-serif', marginBottom: '4px' }}>
                      {post.username}
                    </div>
                    <div style={{ color: '#fff', fontSize: '14px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.4, marginBottom: '8px' }}>
                      {post.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#fff',
                        animation: 'spin 3s linear infinite',
                      }} />
                      <span style={{ color: '#fff', fontSize: '12px', fontFamily: 'system-ui, sans-serif' }}>
                        {post.sound}
                      </span>
                    </div>
                  </div>

                  {/* Right sidebar: engagement icons */}
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    bottom: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                  }}>
                    {/* Heart */}
                    <div style={{ textAlign: 'center' }}>
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      <div style={{ color: '#fff', fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>{post.likes}</div>
                    </div>
                    {/* Comment */}
                    <div style={{ textAlign: 'center' }}>
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      <div style={{ color: '#fff', fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>
                        {Math.floor(parseInt(post.likes.replace(/[^0-9]/g, '')) * 0.1)}
                      </div>
                    </div>
                    {/* Share */}
                    <div style={{ textAlign: 'center' }}>
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M12 2l5.7 5.7-1.41 1.42L13 5.83V16h-2V5.83L7.71 9.12 6.3 7.7 12 2zM21 15v3.5c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5V15h2z" /></svg>
                      <div style={{ color: '#fff', fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>Share</div>
                    </div>
                    {/* Music disc */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#333',
                      border: '2px solid #555',
                      animation: 'spin 3s linear infinite',
                    }} />
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
