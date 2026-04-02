'use client';

import { useMemo } from 'react';
import { INSTAGRAM_POSTS, type InstagramPost } from '@/lib/gametest/feedContent';

interface InstagramFeedProps {
  tier: number;
  images: string[];
  scrollSpeed: number;
}

export default function InstagramFeed({ tier, images, scrollSpeed }: InstagramFeedProps) {
  const posts = useMemo(() => {
    const tierPosts: InstagramPost[] = [];
    for (let t = 0; t <= tier; t++) {
      tierPosts.push(...INSTAGRAM_POSTS[t]);
    }
    return tierPosts;
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
            {posts.map((post, i) => {
              const imgIndex = (copy * posts.length + i) % Math.max(images.length, 1);
              return (
                <div key={`${copy}-${i}`} style={{ borderBottom: '1px solid #efefef' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '10px' }}>
                    <img
                      src={`https://i.pravatar.cc/32?img=${(i + copy * 20 + 10) % 70}`}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }}
                      loading="lazy"
                    />
                    <span style={{ fontWeight: 600, fontSize: '14px', fontFamily: '-apple-system, sans-serif', color: '#262626', flex: 1 }}>
                      {post.username}
                    </span>
                    <span style={{ color: '#8e8e8e', fontSize: '14px' }}>&middot;</span>
                    <span style={{ color: '#8e8e8e', fontSize: '14px', fontFamily: '-apple-system, sans-serif' }}>{post.time}</span>
                    <span style={{ color: '#262626', fontSize: '16px', cursor: 'pointer' }}>&hellip;</span>
                  </div>
                  {/* Image */}
                  {images.length > 0 && (
                    <img
                      src={`/images/gametest/${images[imgIndex]}`}
                      alt=""
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      loading="lazy"
                    />
                  )}
                  {/* Engagement bar */}
                  <div style={{ padding: '10px 16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#262626" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#262626" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#262626" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                      <div style={{ flex: 1 }} />
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#262626" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: '-apple-system, sans-serif', color: '#262626', marginBottom: '4px' }}>
                      {post.likes} likes
                    </div>
                    <div style={{ fontSize: '14px', fontFamily: '-apple-system, sans-serif', color: '#262626', lineHeight: 1.5, marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{post.username}</span>{' '}
                      {post.caption}
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: '-apple-system, sans-serif', color: '#8e8e8e', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {post.time} ago
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
