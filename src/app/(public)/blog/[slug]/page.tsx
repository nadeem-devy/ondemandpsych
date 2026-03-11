import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { notFound } from "next/navigation";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return {};

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || undefined,
      keywords: post.metaKeywords || undefined,
      openGraph: {
        title: post.ogTitle || post.metaTitle || post.title,
        description:
          post.ogDescription || post.metaDescription || post.excerpt || undefined,
        images: post.ogImage ? [post.ogImage] : undefined,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.author],
      },
      robots: post.noIndex ? { index: false, follow: false } : undefined,
      alternates: post.canonicalUrl
        ? { canonical: post.canonicalUrl }
        : undefined,
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post;

  try {
    post = await prisma.blogPost.findUnique({
      where: { slug, status: "published" },
    });
  } catch {
    notFound();
  }

  if (!post) notFound();

  const safeContent = sanitizeHtml(post.content);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage || post.ogImage,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "OnDemandPsych",
      url: "https://ondemandpsych.com",
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SectionWrapper className="py-16 bg-[#07123A]">
        <article className="mx-auto max-w-3xl px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-lg text-white/30 mb-8">
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-white/60 transition-colors"
            >
              Blog
            </Link>
            <span>/</span>
            <span className="text-white/50">{post.title}</span>
          </div>

          {/* Header */}
          <header className="mb-10">
            {post.category && (
              <span className="text-[#FDB02F] text-lg font-semibold uppercase tracking-wider">
                {post.category}
              </span>
            )}
            <h1 className="font-[var(--font-syne)] text-3xl md:text-4xl font-bold text-white mt-2 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-white/40 text-sm">
              <span>{post.author}</span>
              {post.publishedAt && (
                <>
                  <span className="text-white/20">|</span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.split(",").map((tag) => (
                  <span
                    key={tag.trim()}
                    className="px-2.5 py-1 rounded-full bg-[#FDB02F]/10 text-[#FDB02F] text-base font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="rounded-2xl overflow-hidden mb-10">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Sanitized Content */}
          <div
            className="prose prose-invert prose-sm max-w-none
              prose-headings:font-[var(--font-syne)] prose-headings:text-white
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-a:text-[#FDB02F] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-blockquote:border-[#FDB02F]/30 prose-blockquote:text-white/60
              prose-code:text-[#FDB02F] prose-code:bg-[#FDB02F]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-[#0D1B4B] prose-pre:border prose-pre:border-white/10
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <Link
              href="/blog"
              className="text-[#FDB02F] text-sm hover:underline"
            >
              &larr; Back to Blog
            </Link>
          </div>
        </article>
      </SectionWrapper>
    </>
  );
}
