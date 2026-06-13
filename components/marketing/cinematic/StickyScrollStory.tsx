"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** Apple/Framer-style scroll storytelling. One block per "chapter": a tall
 *  container whose interior pins a sticky image while an overlay copy block
 *  scrolls past it. As you scroll past the chapter, the image scales down
 *  and fades — handing off to the next chapter cleanly.
 *
 *  Compose multiple <StickyScrollChapter> in sequence to tell a multi-beat
 *  story. We use this on the home page to walk through the website →
 *  customers → analytics → marketing modules without dumping them in a
 *  flat grid. */

const IMG_PADDING = 12;

export function StickyScrollChapter({
  imgUrl,
  videoUrl,
  subheading,
  heading,
  tone = "dark",
  children,
}: {
  imgUrl?: string;
  videoUrl?: string;
  subheading: string;
  heading: ReactNode;
  /** Overlay tint — most images need a darker scrim for white text legibility;
   *  light-mode renders are also supported but rare for our use case. */
  tone?: "dark" | "light";
  /** Optional content rendered AFTER the sticky panel — typically a 2-col
   *  body section that expands on the chapter's idea. */
  children?: ReactNode;
}) {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-[150vh]">
        <StickyMedia imgUrl={imgUrl} videoUrl={videoUrl} tone={tone} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
}

function StickyMedia({
  imgUrl,
  videoUrl,
  tone,
}: {
  imgUrl?: string;
  videoUrl?: string;
  tone: "dark" | "light";
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  // As the chapter exits, scale the image down to 0.85 and fade the
  // scrim alpha so the next chapter feels like it's emerging from the
  // shrinking one rather than abruptly replacing it.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: imgUrl ? `url(${imgUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl bg-neutral-950"
    >
      {videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
        />
      )}
      <motion.div
        className={
          tone === "dark"
            ? "absolute inset-0 bg-neutral-950/70"
            : "absolute inset-0 bg-white/40"
        }
        style={{ opacity }}
      />
    </motion.div>
  );
}

function OverlayCopy({
  subheading,
  heading,
}: {
  subheading: string;
  heading: ReactNode;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // Copy slides up from below the viewport, sits centered around halfway
  // through the chapter, then slides up out the top as the chapter exits.
  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.2em] text-primary-light md:mb-4 md:text-sm">
        {subheading}
      </p>
      <p className="text-balance px-6 text-center text-5xl font-semibold tracking-[-0.02em] leading-[1.05] md:text-7xl lg:text-[88px]">
        {heading}
      </p>
    </motion.div>
  );
}
