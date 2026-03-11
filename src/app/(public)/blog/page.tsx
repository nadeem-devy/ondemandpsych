import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/ui/PageHero";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Clinical Insights & Updates",
  description:
    "Expert insights on psychiatric clinical decision support, AI in psychiatry, and mental health innovation from Dr. Tanveer A. Padder, MD.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    category: string | null;
    author: string;
    publishedAt: Date | null;
  }[] = [];

  try {
    posts = await prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        author: true,
        publishedAt: true,
      },
    });
  } catch {
    // DB not ready yet
  }

  return (
    <>
      <PageHero
        title="Blog"
        subtitle="Clinical Insights & Updates"
        breadcrumb="Blog"
      />

      <SectionWrapper className="py-16 bg-[#07123A]">
        <div className="mx-auto max-w-6xl px-6">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/40 text-sm">
                No blog posts published yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl bg-[#0D1B4B]/60 border border-white/10 hover:border-[#FDB02F]/25 overflow-hidden transition-all"
                >
                  {/* Image */}
                  <div className="h-44 bg-gradient-to-br from-[#0D1B4B] to-[#07123A] flex items-center justify-center overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-[#FDB02F]/20 text-4xl font-bold font-[var(--font-syne)]">
                        OD
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {post.category && (
                      <span className="text-[#FDB02F] text-base font-semibold uppercase tracking-wider">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-white font-semibold text-sm mt-1 group-hover:text-[#FDB02F] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-white/40 text-lg mt-2 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className="text-white/30 text-base">
                        {post.author}
                      </span>
                      {post.publishedAt && (
                        <span className="text-white/20 text-base">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
