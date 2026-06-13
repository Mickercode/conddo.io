"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

/** Trust / social proof section — two testimonial cards above a closing
 *  line. Until we have real customer logos + names, the cards use
 *  generic role labels ("Business Owner", "Operations Manager") rather
 *  than fabricated names or stock-photo avatars — saying less is better
 *  than saying something that looks fake.
 *
 *  When we get real testimonials, swap the `quotes` array entries for
 *  the real ones with company + name + role + (optionally) avatar. */
export function TrustSection() {
  const quotes = [
    {
      body: "Conddo helped us replace multiple tools with a single system. Our team spends less time managing processes and more time serving customers.",
      role: "Business Owner",
    },
    {
      body: "Having our customers, payments, and operations connected in one platform has completely changed how we work.",
      role: "Operations Manager",
    },
  ];

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-36">
        <div className="max-w-3xl mb-14 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Trust
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Businesses grow faster when operations are <span className="text-primary-light">organized</span>.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          {quotes.map((q, i) => (
            <motion.figure
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-10 backdrop-blur relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, borderColor: "rgba(160,127,212,0.3)" }}
            >
              <Quote className="absolute top-6 right-6 h-5 w-5 text-primary-light/30" strokeWidth={1.5} />
              <blockquote className="text-pretty text-lg md:text-xl text-white/85 leading-relaxed font-light">
                &ldquo;{q.body}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center font-mono text-[11px] text-primary-light uppercase">
                  {q.role
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="text-[13px] font-medium text-white/70">{q.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
