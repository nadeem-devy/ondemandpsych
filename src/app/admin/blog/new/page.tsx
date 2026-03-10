"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BlogEditor } from "@/components/admin/BlogEditor";

export default function NewBlogPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const post = await res.json();
      router.push(`/admin/blog/${post.id}`);
    } catch {
      alert("Failed to save");
      setSaving(false);
    }
  }

  return (
    <BlogEditor
      onSave={handleSave}
      saving={saving}
    />
  );
}
