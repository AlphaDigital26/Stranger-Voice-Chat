import Link from "next/link";
import { BookOpen, ArrowRight, Clock } from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — PitchLine",
  description: "Founder stories, idea validation tips, and startup feedback strategies from the PitchLine community.",
};

import { BLOG_POSTS } from "./data";

const CATEGORY_COLORS: Record<string, string> = {
  "Pitching": "bg-[rgba(124,92,252,0.1)] text-[#7C5CFC]",
  "Feedback": "bg-[rgba(34,197,94,0.1)] text-[#22C55E]",
  "Founder Stories": "bg-[rgba(245,158,11,0.1)] text-[#F59E0B]",
  "Validation": "bg-[rgba(100,116,139,0.1)] text-[#64748B]",
  "Insights": "bg-[rgba(239,68,68,0.1)] text-[#EF4444]",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-white border-b border-[#E5E5E8] py-12 px-4">
          <div className="container-app max-w-[720px] text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen size={20} className="text-[#7C5CFC]" />
              <span className="text-[13px] font-semibold text-[#7C5CFC] uppercase tracking-wide">PitchLine Blog</span>
            </div>
            <h1 className="text-[2rem] font-bold text-[#18181B] mb-3">Startup wisdom for builders</h1>
            <p className="text-[16px] text-[#71717A] max-w-md mx-auto leading-relaxed">
              Idea validation, pitching tips, and founder conversations — curated for early-stage builders.
            </p>
          </div>
        </div>

        <div className="container-app max-w-[720px] py-10 px-4">
          {/* Ad slot — above posts */}
          <AdSlot height={90} className="mb-8" />

          {/* Coming soon notice */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[rgba(124,92,252,0.06)] border border-[rgba(124,92,252,0.15)] rounded-[12px] mb-6">
            <Clock size={16} className="text-[#7C5CFC] shrink-0" />
            <p className="text-[13px] text-[#7C5CFC]">
              <strong>Coming soon</strong> — our first articles are being written. Subscribe below to be notified at launch.
            </p>
          </div>

          {/* Post cards */}
          <div className="grid grid-cols-1 gap-4">
            {BLOG_POSTS.map(post => (
              <Link href={`/blog/${post.slug}`} key={post.slug}>
                <article
                  className="bg-white border border-[#E5E5E8] rounded-[12px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-[#7C5CFC]/30 hover:shadow-[0_2px_8px_rgba(124,92,252,0.08)] transition-all group cursor-pointer"
                >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? "bg-[#F4F4F5] text-[#71717A]"}`}>
                        {post.category}
                      </span>
                      <span className="text-[11px] text-[#71717A]">{post.readTime}</span>
                    </div>
                    <h2 className="text-[16px] font-bold text-[#18181B] mb-1.5 group-hover:text-[#7C5CFC] transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-[13px] text-[#71717A] leading-relaxed">{post.description}</p>
                  </div>
                  <ArrowRight size={18} className="text-[#71717A] group-hover:text-[#7C5CFC] transition-colors shrink-0 mt-1" />
                </div>
                <div className="mt-3 pt-3 border-t border-[#F4F4F5]">
                  <span className="text-[11px] text-[#71717A] italic">{post.date}</span>
                </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Email signup stub */}
          <div className="mt-10 mb-16 bg-gradient-to-br from-[#7C5CFC] to-[#9B82FF] rounded-[16px] p-6 sm:p-8 text-center text-white">
            <h2 className="text-[18px] sm:text-[20px] font-bold mb-2">Get notified when we publish</h2>
            <p className="text-[14px] text-white/80 mb-6">Startup insights, founder stories, and pitching tips — directly in your inbox.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 text-[14px] text-[#18181B] bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-white/60 placeholder:text-[#71717A]"
                aria-label="Email for blog updates"
              />
              <button className="px-5 py-2.5 text-[14px] font-semibold text-[#7C5CFC] bg-white rounded-full hover:bg-[#F4F4F5] hover:scale-105 transition-all shadow-md whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
