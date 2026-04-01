import Link from "next/link";
import Image from "next/image";

const TOOLS = [
  {
    number: 5,
    name: "color.separator",
    year: "2026",
    description: "Digital color separation for woodblock, CNC, and silkscreen printing.",
    href: "/color-separator",
    external: false,
    screenshot: "/screenshots/colorsep.png",
  },
  {
    number: 4,
    name: "newsroom",
    year: "2026",
    description: "Art news aggregator with daily scanning, taste scoring, and editorial picks.",
    href: "https://newsroom.reidsurmeier.wtf",
    external: true,
    screenshot: "/screenshots/newsroom.png",
  },
  {
    number: 3,
    name: "imageroom",
    year: "2026",
    description: "Image feed and graph visualization from 300+ followed accounts.",
    href: "https://imageroom.reidsurmeier.wtf",
    external: true,
    screenshot: "/screenshots/imageroom.png",
  },
  {
    number: 2,
    name: "events",
    year: "2026",
    description: "Art events map and calendar for New York galleries.",
    href: "https://events.reidsurmeier.wtf",
    external: true,
    screenshot: "/screenshots/events.png",
  },
  {
    number: 1,
    name: "sound",
    year: "2026",
    description: "Sound tools and experiments.",
    href: "https://sound.reidsurmeier.wtf",
    external: true,
    screenshot: null,
  },
];

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const content = (
    <div className="tool-tile">
      <div className="tool-tile-header">
        <span className="tool-tile-num">{tool.number}.</span>
        <span className="tool-tile-name">{tool.name}</span>
        <span className="tool-tile-year">{tool.year}</span>
      </div>
      <div className="tool-tile-img">
        {tool.screenshot ? (
          <Image
            src={tool.screenshot}
            alt={tool.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="tool-tile-screenshot"
          />
        ) : (
          <div className="tool-tile-placeholder">coming soon</div>
        )}
      </div>
      <div className="tool-tile-footer">
        <span className="tool-tile-desc">{tool.description}</span>
        <span className="tool-tile-launch">Launch →</span>
      </div>
    </div>
  );

  if (tool.external) {
    return (
      <a href={tool.href} className="tool-tile-link" target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={tool.href} className="tool-tile-link">
      {content}
    </Link>
  );
}

export default function Home() {
  return (
    <main className="tools-homepage">
      <header className="tools-header">
        <h1 className="tools-title">tools.reidsurmeier.wtf</h1>
        <p className="tools-byline">
          <a href="https://www.are.na/reid-surmeier/channels" target="_blank" rel="noreferrer">are.na</a>
          {" · "}
          <a href="https://www.instagram.com/reidsurmeier/" target="_blank" rel="noreferrer">instagram</a>
          {" · "}
          <a href="https://reidsurmeier.wtf" target="_blank" rel="noreferrer">reidsurmeier.wtf</a>
        </p>
      </header>
      <div className="tools-grid">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>
    </main>
  );
}
