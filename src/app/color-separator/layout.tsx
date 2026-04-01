import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "color.separator — digital color separation tool",
  description: "Digital color separation for woodblock, CNC, and silkscreen printing",
};

export default function ColorSeparatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
