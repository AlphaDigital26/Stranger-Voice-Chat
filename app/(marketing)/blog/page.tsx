import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — PitchLine",
  description: "Founder stories, idea validation tips, and startup feedback strategies from the PitchLine community.",
};

import { BLOG_POSTS } from "./data";

// One sticky-note colour per category
const CATEGORY_NOTES: Record<string, string> = {
  "Pitching": "bg-note-yellow",
  "Feedback": "bg-note-pink",
  "Founder Stories": "bg-note-orange",
  "Validation": "bg-note-green",
  "Insights": "bg-note-blue",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />

      <main className="flex-1">
        {/* Hero */}
        <div className="container-app max-w-[780px] pt-12 pb-8">
          <span className="font-hand text-[28px] text-marker -rotate-2 inline-block">the pitchline blog</span>
          <h1 className="mt-1 text-[2.5rem] sm:text-[3.25rem] font-extrabold tracking-[-0.03em] leading-[1.05]">
            Notes for people with ideas
          </h1>
          <p className="mt-3 text-[18px] text-muted max-w-[560px] leading-relaxed">
            Idea validation, pitching tips and founder conversations, written for early-stage builders.
          </p>
        </div>

        <div className="container-app max-w-[780px] pb-16">
          {/* Post cards */}
          <div className="flex flex-col gap-4">
            {BLOG_POSTS.map(post => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                <article className="bg-surface border-2 border-outline rounded-[16px] p-6 group-hover:-translate-y-0.5 group-hover:shadow-note transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`text-[13px] font-bold px-2.5 py-1 -rotate-1 ${CATEGORY_NOTES[post.category] ?? "bg-paper-2"}`}>
                          {post.category}
                        </span>
                        <span className="text-[13px] text-muted">{post.date} · {post.readTime}</span>
                      </div>
                      <h2 className="text-[20px] font-extrabold leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-1.5 text-[15px] text-muted leading-relaxed">{post.description}</p>
                    </div>
                    <ArrowRight size={22} className="shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Ad slot — between posts and signup, never above the fold */}
          <AdSlot height={90} variant={2} className="mt-10" />

          {/* Email signup stub */}
          <div className="mt-10 bg-note-yellow shadow-note p-7 sm:p-9 text-center rotate-1">
            <p className="font-hand font-bold text-[30px] leading-none text-marker">new posts, in your inbox</p>
            <h2 className="mt-2 text-[1.5rem] font-extrabold tracking-tight">Get notified when we publish</h2>
            <p className="mt-1 text-[15px] text-ink/80">Founder stories and pitching tips. No spam.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 max-w-[420px] mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 px-4 py-3 text-[15px] text-ink bg-surface border-2 border-outline rounded-[12px] focus:outline-none focus:border-primary placeholder:text-muted"
                aria-label="Email for blog updates"
              />
              <button className="px-5 py-3 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[12px] transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
