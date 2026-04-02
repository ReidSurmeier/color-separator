import Script from 'next/script';

export default function GameTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="/webgazer.js" strategy="beforeInteractive" />
      {children}
    </>
  );
}
