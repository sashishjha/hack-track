import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
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
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const chipClass = (filter: string) =>
    activeFilter === filter
      ? "px-3 sm:px-5 py-1.5 sm:py-2 bg-primary text-primary-foreground font-mono text-[10px] sm:text-xs uppercase rounded-full shadow-sm hover:scale-105 transition-transform"
      : "px-3 sm:px-5 py-1.5 sm:py-2 bg-card border border-border text-foreground font-mono text-[10px] sm:text-xs uppercase rounded-full hover:border-primary transition-colors";

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="size-8 sm:size-10 bg-primary flex items-center justify-center rounded-sm rotate-3 shadow-lg">
              <span className="font-display text-primary-foreground text-xl sm:text-2xl tracking-tighter">H</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-wide">HackTrack</h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-2">
              <div className="size-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Live sync: 12:44:02
              </span>
            </div>
            <button className="bg-foreground text-background font-mono text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-primary transition-colors">
              REFRESH
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center animate-in">
        <h2 className="text-[clamp(2.5rem,11vw,8rem)] font-display leading-[0.9] mb-4 sm:mb-6 text-balance">
          THE{" "}
          <span className="text-primary italic font-serif lowercase tracking-normal">
            global
          </span>{" "}
          HACKATHON
          <br />
          COLLECTIVE
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 text-pretty px-2">
          Your personal dashboard for high-stakes competition. Aggregating the world's most
          prestigious builds from Kaggle to Zindi.
        </p>

        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by tech stack or prize..."
            className="w-full bg-card border-2 border-foreground px-4 sm:px-6 py-3 sm:py-4 pr-20 sm:pr-24 text-sm sm:text-base rounded-xl shadow-[4px_4px_0px_0px_var(--foreground)] focus:shadow-[8px_8px_0px_0px_var(--primary)] outline-none transition-all placeholder:text-muted-foreground/60"
          />
          <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-accent px-2 py-1 rounded border border-foreground text-accent-foreground">
            CMD + K
          </div>
        </div>
      </header>

      {/* Filters — desktop/tablet inline */}
      <section className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-12 flex-wrap gap-2 sm:gap-3 justify-center animate-in">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={chipClass(filter)}
          >
            {filter}
          </button>
        ))}
      </section>

      {/* Filters — mobile trigger */}
      <section className="sm:hidden max-w-7xl mx-auto px-4 mb-8 flex items-center justify-between gap-3 animate-in">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Filter:{" "}
          <span className="text-foreground font-bold normal-case">{activeFilter}</span>
        </p>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button className="inline-flex items-center gap-2 bg-foreground text-background font-mono text-[11px] uppercase px-4 py-2 rounded-full">
              <SlidersHorizontal className="size-3.5" />
              Filters
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-background border-t-2 border-foreground">
            <DrawerHeader className="text-left">
              <DrawerTitle className="font-display text-3xl tracking-wide">
                Filter Platforms
              </DrawerTitle>
              <DrawerDescription className="font-mono text-[11px] uppercase tracking-widest">
                Pick a source to refine the grid
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setDrawerOpen(false);
                  }}
                  className={chipClass(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button className="w-full bg-foreground text-background font-mono text-xs uppercase py-3 rounded-full">
                  Done
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </section>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {hackathons.map((h) => (
          <article
            key={h.title}
            className={`bg-card border-2 border-foreground rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_var(--foreground)] group hover:-translate-y-1 transition-all animate-in ${hoverShadowClass[h.hoverShadow]}`}
          >
            <div className="p-5 sm:p-6">
              <div className="flex justify-between items-start mb-5 sm:mb-6 gap-3 sm:gap-4">
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
                        ? "font-bold text-green-600 text-sm sm:text-base"
                        : "font-bold text-sm sm:text-base"
                    }
                  >
                    {h.meta.value}
                  </p>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-display leading-tight mb-4 group-hover:text-primary transition-colors">
                {h.title}
              </h3>

              <img
                src={h.image}
                alt={h.imageAlt}
                loading="lazy"
                width={1024}
                height={512}
                className="w-full aspect-[2/1] object-cover rounded-lg mb-5 sm:mb-6"
              />

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                {h.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] sm:text-[11px] font-mono border border-border px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-5 sm:pt-6 border-t border-dashed border-border">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">
                    Prize Pool
                  </p>
                  <p className="text-lg sm:text-xl font-display text-primary">{h.prize}</p>
                </div>
                <button
                  aria-label={`View ${h.title}`}
                  className="size-10 sm:size-12 shrink-0 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-primary transition-colors text-lg"
                >
                  →
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 border-t-2 border-foreground pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
        <div className="flex flex-wrap gap-8 sm:gap-12 justify-center text-center sm:text-left">
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Active Hackathons
            </p>
            <p className="text-2xl sm:text-3xl font-display">142</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Total Bounty
            </p>
            <p className="text-2xl sm:text-3xl font-display">$4.2M</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Platforms
            </p>
            <p className="text-2xl sm:text-3xl font-display">09</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-serif italic text-sm sm:text-base text-muted-foreground">
            Stay hungry, keep building.
          </span>
          <a
            href="#top"
            className="size-10 sm:size-12 shrink-0 rounded-full border-2 border-foreground grid place-items-center font-display text-lg sm:text-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            ↑
          </a>
        </div>
      </footer>
    </div>
  );
}
