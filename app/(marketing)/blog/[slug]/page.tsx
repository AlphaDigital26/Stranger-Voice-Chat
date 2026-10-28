import { BLOG_POSTS } from "../data";
import TopNav from "@/components/layout/TopNav";
import AdSlot from "@/components/ui/AdSlot";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// Next.js 16: params is a Promise and must be awaited
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
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

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  // A very simple markdown-to-html renderer since we only use basic tags in our data.
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, idx) => {
        if (line.startsWith('# ')) {
          return <h2 key={idx} className="text-[1.875rem] font-extrabold tracking-tight mt-10 mb-5">{line.slice(2)}</h2>;
        } else if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-[1.5rem] font-extrabold tracking-tight mt-10 mb-4">{line.slice(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-[1.25rem] font-bold mt-8 mb-3">{line.slice(4)}</h3>;
        } else if (line.trim() === '') {
          return null;
        } else {
          // parse bold and italic (extremely naive implementation for trusted local data)
          let parsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
          return <p key={idx} className="mb-5 leading-[1.75]" dangerouslySetInnerHTML={{ __html: parsed }} />;
        }
      });
  };

  return (
    <div className="min-h-screen bg-dots flex flex-col">
      <TopNav />
      <main className="flex-1 container-app max-w-[780px] py-10">

        <Link href="/blog" className="inline-flex items-center gap-2 min-h-[44px] text-[15px] font-bold hover:text-primary transition-colors mb-6">
          <ArrowLeft size={18} /> All articles
        </Link>

        <article className="bg-surface border-2 border-outline rounded-[16px] px-4 py-7 sm:px-12 sm:py-12">
          <header className="mb-8 border-b-2 border-dashed border-line pb-8">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[13px] font-bold px-2.5 py-1 bg-note-yellow -rotate-1">
                {post.category}
              </span>
              <span className="text-[14px] text-muted">{post.date} · {post.readTime}</span>
            </div>

            <h1 className="text-[2.25rem] sm:text-[2.75rem] font-extrabold tracking-[-0.03em] leading-[1.08] mb-4">{post.title}</h1>
            <p className="text-[19px] text-muted leading-relaxed">{post.description}</p>
          </header>

          <AdSlot height={90} variant={0} className="mb-10" />

          <div className="text-[17px] text-ink max-w-[65ch]">
            {renderMarkdown(post.content)}
          </div>

          <AdSlot height={90} variant={3} className="mt-10" />
        </article>

        {/* Back into the product */}
        <div className="mt-10 bg-note-yellow shadow-note p-7 text-center -rotate-1">
          <p className="font-hand font-bold text-[30px] leading-none">got an idea of your own?</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center px-6 py-3 text-[15px] font-bold text-on-primary bg-primary hover:bg-primary-hover rounded-[12px] transition-colors"
          >
            Pitch it to a stranger
          </Link>
        </div>
      </main>
    </div>
  );
}
