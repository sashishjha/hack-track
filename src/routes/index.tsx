import { createFileRoute } from "@tanstack/react-router";
import cardBirds from "@/assets/card-birds.jpg";
import cardCities from "@/assets/card-cities.jpg";
import cardRobot from "@/assets/card-robot.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

type Hackathon = {
  platform: string;
  platformStyle: "secondary" | "primary" | "ink";
  title: string;
  image: string;
  imageAlt: string;
  tags: string[];
  prize: string;
  meta: { label: string; value: string; tone?: "default" | "good" };
  hoverShadow: "secondary" | "accent" | "primary";
};

const hackathons: Hackathon[] = [
  {
    platform: "Kaggle",
    platformStyle: "secondary",
    title: "BirdCALL Identification: SIFT+BERT Challenge",
    image: cardBirds,
    imageAlt: "Abstract geometric pattern in teal and orange",
    tags: ["Python", "Audio AI", "Signal Processing"],
    prize: "$50,000",
    meta: { label: "Ends in", value: "14 Days" },
    hoverShadow: "secondary",
  },
  {
    platform: "Devpost",
    platformStyle: "primary",
    title: "The Sustainable Cities Buildathon 2024",
    image: cardCities,
    imageAlt: "Soft isometric city illustration in warm pastel tones",
    tags: ["React", "Google Maps SDK", "GreenTech"],
    prize: "$15,000 + Credits",
    meta: { label: "Status", value: "Registration Open", tone: "good" },
    hoverShadow: "accent",
  },
  {
    platform: "Unstop",
    platformStyle: "ink",
    title: "Flipkart GRiD 6.0 — Robotics Track",
    image: cardRobot,
    imageAlt: "Minimalist robot arm diagram",
    tags: ["ROS", "Embedded C++", "IoT"],
    prize: "INR 35,00,000",
    meta: { label: "Deadline", value: "Dec 12" },
    hoverShadow: "primary",
  },
];

const filters = ["All Platforms", "Kaggle", "Devpost", "Unstop", "Zindi", "AIcrowd"];

const platformBadgeClass: Record<Hackathon["platformStyle"], string> = {
  secondary: "bg-secondary/10 text-secondary border border-secondary/20",
  primary: "bg-primary/10 text-primary border border-primary/20",
  ink: "bg-foreground text-background",
};

const hoverShadowClass: Record<Hackathon["hoverShadow"], string> = {
  secondary: "hover:shadow-[12px_12px_0px_0px_var(--secondary)]",
  accent: "hover:shadow-[12px_12px_0px_0px_var(--accent)]",
  primary: "hover:shadow-[12px_12px_0px_0px_var(--primary)]",
};

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary flex items-center justify-center rounded-sm rotate-3 shadow-lg">
              <span className="font-display text-primary-foreground text-2xl tracking-tighter">H</span>
            </div>
            <h1 className="font-display text-3xl tracking-wide">HackTrack</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Live sync: 12:44:02
              </span>
            </div>
            <button className="bg-foreground text-background font-mono text-xs px-4 py-2 rounded-full hover:bg-primary transition-colors">
              REFRESH
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-6 py-16 text-center animate-in">
        <h2 className="text-6xl md:text-8xl font-display leading-[0.9] mb-4 text-balance">
          THE{" "}
          <span className="text-primary italic font-serif lowercase tracking-normal">
            global
          </span>{" "}
          HACKATHON
          <br />
          COLLECTIVE
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground mb-12 text-pretty">
          Your personal dashboard for high-stakes competition. Aggregating the world's most
          prestigious builds from Kaggle to Zindi.
        </p>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by tech stack or prize..."
            className="w-full bg-card border-2 border-foreground px-6 py-4 rounded-xl shadow-[4px_4px_0px_0px_var(--foreground)] focus:shadow-[8px_8px_0px_0px_var(--primary)] outline-none transition-all placeholder:text-muted-foreground/60"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-accent px-2 py-1 rounded border border-foreground text-accent-foreground">
            CMD + K
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 mb-12 flex flex-wrap gap-3 justify-center animate-in">
        {filters.map((filter, i) => (
          <button
            key={filter}
            className={
              i === 0
                ? "px-5 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase rounded-full shadow-sm hover:scale-105 transition-transform"
                : "px-5 py-2 bg-card border border-border text-foreground font-mono text-xs uppercase rounded-full hover:border-primary transition-colors"
            }
          >
            {filter}
          </button>
        ))}
      </section>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hackathons.map((h) => (
          <article
            key={h.title}
            className={`bg-card border-2 border-foreground rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_var(--foreground)] group hover:-translate-y-1 transition-all animate-in ${hoverShadowClass[h.hoverShadow]}`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 gap-4">
                <span
                  className={`font-mono text-[10px] px-2 py-1 rounded uppercase tracking-tighter font-bold ${platformBadgeClass[h.platformStyle]}`}
                >
                  {h.platform}
                </span>
                <div className="text-right">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase">
                    {h.meta.label}
                  </p>
                  <p
                    className={
                      h.meta.tone === "good"
                        ? "font-bold text-green-600"
                        : "font-bold"
                    }
                  >
                    {h.meta.value}
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-display leading-tight mb-4 group-hover:text-primary transition-colors">
                {h.title}
              </h3>

              <img
                src={h.image}
                alt={h.imageAlt}
                loading="lazy"
                width={1024}
                height={512}
                className="w-full aspect-[2/1] object-cover rounded-lg mb-6"
              />

              <div className="flex flex-wrap gap-2 mb-8">
                {h.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono border border-border px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-dashed border-border">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Prize Pool
                  </p>
                  <p className="text-xl font-display text-primary">{h.prize}</p>
                </div>
                <button
                  aria-label={`View ${h.title}`}
                  className="size-12 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-primary transition-colors text-lg"
                >
                  →
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 border-t-2 border-foreground pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-wrap gap-12 justify-center">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Active Hackathons
            </p>
            <p className="text-3xl font-display">142</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Total Bounty
            </p>
            <p className="text-3xl font-display">$4.2M</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Platforms
            </p>
            <p className="text-3xl font-display">09</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-serif italic text-muted-foreground">
            Stay hungry, keep building.
          </span>
          <a
            href="#top"
            className="size-12 rounded-full border-2 border-foreground grid place-items-center font-display text-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
