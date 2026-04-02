'use client';

import { useMemo } from 'react';
import { TWITTER_POSTS, type TwitterPost } from '@/lib/gametest/feedContent';

interface TwitterFeedProps {
  tier: number;
  images: string[];
  scrollSpeed: number;
}

export default function TwitterFeed({ tier, images, scrollSpeed }: TwitterFeedProps) {
  const posts = useMemo(() => {
    const tierPosts: TwitterPost[] = [];
    for (let t = 0; t <= tier; t++) {
      tierPosts.push(...TWITTER_POSTS[t]);
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
              const imgIndex = (copy * posts.length + i) % images.length;
              const showMedia = images.length > 0 && i % 3 === 0;
              return (
                <div
                  key={`${copy}-${i}`}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #333',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <img
                      src={`https://i.pravatar.cc/40?img=${(i + copy * 30) % 70}`}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        flexShrink: 0,
                      }}
                      loading="lazy"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {post.displayName}
                        </span>
                        {post.verified && (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="#1d9bf0">
                            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                          </svg>
                        )}
                        <span style={{ color: '#71767b', fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {post.handle}
                        </span>
                        <span style={{ color: '#71767b', fontSize: '15px' }}>&middot;</span>
                        <span style={{ color: '#71767b', fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {post.time}
                        </span>
                      </div>
                      <p style={{ color: '#e7e9ea', fontSize: '15px', lineHeight: 1.5, fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, wordWrap: 'break-word' }}>
                        {post.text}
                      </p>
                      {showMedia && images.length > 0 && (
                        <div style={{ marginTop: '12px', borderRadius: '16px', overflow: 'hidden' }}>
                          <img
                            src={`/images/gametest/${images[imgIndex]}`}
                            alt=""
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', maxWidth: '300px' }}>
                        {[
                          <svg key="reply" viewBox="0 0 24 24" width="18" height="18" fill="#71767b"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.25-.893 4.306-2.394 5.82l-5.96 5.96c-.283.282-.663.44-1.06.44-.397 0-.777-.158-1.06-.44l-5.96-5.96A8.232 8.232 0 011.751 10zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 1.625.65 3.196 1.796 4.343l5.453 5.453 5.453-5.453A6.235 6.235 0 0018.251 10.13C18.251 6.846 15.568 4 12.122 4H9.756z" /></svg>,
                          <svg key="retweet" viewBox="0 0 24 24" width="18" height="18" fill="#71767b"><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" /></svg>,
                          <svg key="like" viewBox="0 0 24 24" width="18" height="18" fill="#71767b"><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.56-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" /></svg>,
                          <svg key="share" viewBox="0 0 24 24" width="18" height="18" fill="#71767b"><path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" /></svg>,
                        ].map((icon, idx) => (
                          <span key={idx} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {icon}
                            {idx === 1 && <span style={{ color: '#71767b', fontSize: '13px' }}>{post.retweets}</span>}
                            {idx === 2 && <span style={{ color: '#71767b', fontSize: '13px' }}>{post.likes}</span>}
                          </span>
                        ))}
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
