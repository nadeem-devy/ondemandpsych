"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default function EditBlogPost() {
  const params = useParams();
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blog?id=${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
          return;
        }
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id, ...data }),
      });
      setSaving(false);
    } catch {
      alert("Failed to save");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-white/40 text-sm">Loading post...</div>
    );
  }

  if (!post) {
    return <div className="p-8 text-white/40 text-sm">Post not found</div>;
  }

  return <BlogEditor post={post} onSave={handleSave} saving={saving} />;
}
