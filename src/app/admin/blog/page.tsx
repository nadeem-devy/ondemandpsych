"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, PenSquare, Trash2, Eye, Clock } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setPosts(posts.filter((p) => p.id !== id));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-white/40 text-sm mt-1">
            Create and manage blog articles
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-sm hover:bg-[#FDAA40] transition-colors"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {loading ? (
        <div className="text-white/40 text-sm">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-[#0D1B4B]/40 border border-white/10 rounded-2xl">
          <PenSquare size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No blog posts yet</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#FDB02F] text-[#07123A] font-bold text-sm hover:bg-[#FDAA40] transition-colors"
          >
            <Plus size={16} />
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="bg-[#0D1B4B]/40 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/40 text-xs font-medium px-6 py-3">
                  Title
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-6 py-3">
                  Status
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-6 py-3">
                  Category
                </th>
                <th className="text-left text-white/40 text-xs font-medium px-6 py-3">
                  Date
                </th>
                <th className="text-right text-white/40 text-xs font-medium px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="text-white text-sm font-medium hover:text-[#FDB02F] transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-white/30 text-xs mt-0.5">
                      /blog/{post.slug}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-yellow-500/15 text-yellow-400"
                      }`}
                    >
                      {post.status === "published" ? (
                        <Eye size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-sm">
                    {post.category || "—"}
                  </td>
                  <td className="px-6 py-4 text-white/40 text-xs">
                    {new Date(
                      post.publishedAt || post.createdAt
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-2 rounded-lg text-white/40 hover:text-[#FDB02F] hover:bg-white/5 transition-colors"
                      >
                        <PenSquare size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
