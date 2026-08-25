import { BLOG_POSTS } from "../data";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) return { title: "Post Not Found" };
  
  return {
    title: `${post.title} — PitchLine Blog`,
    description: post.description,
  };
}

export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  
  if (!post) {
    notFound();
  }

  // A very simple markdown-to-html renderer since we only use basic tags in our data.
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, idx) => {
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-[2rem] font-bold text-[#18181B] mt-10 mb-6">{line.slice(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-[1.5rem] font-semibold text-[#18181B] mt-10 mb-4">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-[1.25rem] font-semibold text-[#18181B] mt-8 mb-3">{line.slice(4)}</h3>;
        } else if (line.trim() === '') {
          return <br key={idx} />;
        } else {
          // parse bold and italic (extremely naive implementation for trusted local data)
          let parsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
          return <p key={idx} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: parsed }} />;
        }
      });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <TopNav />
      <main className="flex-1 container-app max-w-[800px] py-12 px-4">
        
        <Link href="/blog" className="inline-flex items-center gap-2 text-[14px] text-[#71717A] hover:text-[#7C5CFC] transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        
        <article className="bg-white border border-[#E5E5E8] rounded-[16px] p-6 sm:p-10 shadow-[0_4px_20px_-2px_rgba(124,92,252,0.04)]">
          <header className="mb-8 border-b border-[#F4F4F5] pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[rgba(124,92,252,0.1)] text-[#7C5CFC]">
                {post.category}
              </span>
              <span className="text-[13px] text-[#71717A]">{post.date}</span>
              <span className="text-[13px] text-[#71717A]">•</span>
              <span className="text-[13px] text-[#71717A]">{post.readTime}</span>
            </div>
            
            <h1 className="text-[2.25rem] font-bold text-[#18181B] leading-tight mb-4">{post.title}</h1>
            <p className="text-[18px] text-[#71717A] leading-relaxed">{post.description}</p>
          </header>

          <AdSlot height={90} className="mb-10" />

          <div className="text-[16px] text-[#3F3F46]">
            {renderMarkdown(post.content)}
          </div>
          
          <AdSlot height={90} className="mt-10" />
        </article>

      </main>
    </div>
  );
}
