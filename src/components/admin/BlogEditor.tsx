"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import {
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Globe,
  Share2,
  Tag,
} from "lucide-react";

interface BlogEditorProps {
  post?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
}

export function BlogEditor({ post, onSave, saving }: BlogEditorProps) {
  const [title, setTitle] = useState((post?.title as string) || "");
  const [slug, setSlug] = useState((post?.slug as string) || "");
  const [excerpt, setExcerpt] = useState((post?.excerpt as string) || "");
  const [content, setContent] = useState((post?.content as string) || "");
  const [featuredImage, setFeaturedImage] = useState(
    (post?.featuredImage as string) || ""
  );
  const [status, setStatus] = useState(
    (post?.status as string) || "draft"
  );
  const [category, setCategory] = useState(
    (post?.category as string) || ""
  );
  const [tags, setTags] = useState((post?.tags as string) || "");
  const [author, setAuthor] = useState(
    (post?.author as string) || "Dr. Tanveer A. Padder, MD"
  );

  // SEO fields
  const [metaTitle, setMetaTitle] = useState(
    (post?.metaTitle as string) || ""
  );
  const [metaDescription, setMetaDescription] = useState(
    (post?.metaDescription as string) || ""
  );
  const [metaKeywords, setMetaKeywords] = useState(
    (post?.metaKeywords as string) || ""
  );
  const [ogTitle, setOgTitle] = useState((post?.ogTitle as string) || "");
  const [ogDescription, setOgDescription] = useState(
    (post?.ogDescription as string) || ""
  );
  const [ogImage, setOgImage] = useState((post?.ogImage as string) || "");
  const [canonicalUrl, setCanonicalUrl] = useState(
    (post?.canonicalUrl as string) || ""
  );
  const [noIndex, setNoIndex] = useState(
    (post?.noIndex as boolean) || false
  );
  const [schemaType, setSchemaType] = useState(
    (post?.schemaType as string) || "Article"
  );

  // Panel toggles
  const [showSeo, setShowSeo] = useState(false);
  const [showOg, setShowOg] = useState(false);
  const [saved, setSaved] = useState(false);

  function generateSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!post) {
      setSlug(generateSlug(val));
    }
  }

  function handleSave(saveStatus?: string) {
    const data = {
      title,
      slug,
      excerpt,
      content,
      featuredImage: featuredImage || null,
      status: saveStatus || status,
      category: category || null,
      tags: tags || null,
      author,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null,
      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,
      ogImage: ogImage || null,
      canonicalUrl: canonicalUrl || null,
      noIndex,
      schemaType,
    };

    onSave(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const metaTitleLen = (metaTitle || title).length;
  const metaDescLen = (metaDescription || excerpt).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">
          {post ? "Edit Post" : "New Blog Post"}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving || !title}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              saved
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-[#FDB02F] text-[#07123A] hover:bg-[#FDAA40]"
            } disabled:opacity-50`}
          >
            {saving ? (
              "Saving..."
            ) : saved ? (
              "Saved!"
            ) : (
              <>
                <Eye size={16} />
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-lg font-bold focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
            placeholder="Post title"
          />

          {/* Slug */}
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-lg">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white/60 text-lg focus:outline-none focus:border-[#FDB02F]/50 transition-colors"
            />
          </div>

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50 transition-colors resize-y"
            placeholder="Brief excerpt (displayed in blog listings and meta description fallback)"
          />

          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your blog post content..."
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Category */}
          <div className="bg-[#0D1B4B]/60 border border-white/10 rounded-xl p-4 space-y-3">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <Tag size={14} className="text-[#FDB02F]" />
              Post Settings
            </h3>

            <div>
              <label className="block text-white/40 text-lg mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-white/40 text-lg mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                placeholder="e.g., Clinical Insights"
              />
            </div>

            <div>
              <label className="block text-white/40 text-lg mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                placeholder="psychiatry, AI, clinical-support"
              />
            </div>

            <div>
              <label className="block text-white/40 text-lg mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
              />
            </div>

            <div>
              <label className="block text-white/40 text-lg mb-1">
                Featured Image URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* SEO Panel */}
          <div className="bg-[#0D1B4B]/60 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-white text-sm font-semibold flex items-center gap-2">
                <Search size={14} className="text-[#FDB02F]" />
                SEO Settings
              </span>
              {showSeo ? (
                <ChevronUp size={16} className="text-white/40" />
              ) : (
                <ChevronDown size={16} className="text-white/40" />
              )}
            </button>

            {showSeo && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                <div>
                  <label className="flex items-center justify-between text-white/40 text-lg mb-1">
                    <span>Meta Title</span>
                    <span
                      className={
                        metaTitleLen > 60 ? "text-red-400" : "text-white/20"
                      }
                    >
                      {metaTitleLen}/60
                    </span>
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                    placeholder={title || "Defaults to post title"}
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-white/40 text-lg mb-1">
                    <span>Meta Description</span>
                    <span
                      className={
                        metaDescLen > 160 ? "text-red-400" : "text-white/20"
                      }
                    >
                      {metaDescLen}/160
                    </span>
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50 resize-y"
                    placeholder={excerpt || "Defaults to excerpt"}
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-lg mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-lg mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                    placeholder="https://ondemandpsych.com/blog/..."
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-lg mb-1">
                    Schema Type
                  </label>
                  <select
                    value={schemaType}
                    onChange={(e) => setSchemaType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                  >
                    <option value="Article">Article</option>
                    <option value="BlogPosting">BlogPosting</option>
                    <option value="MedicalWebPage">MedicalWebPage</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => setNoIndex(e.target.checked)}
                    className="rounded border-white/20"
                  />
                  <span className="text-white/40 text-lg">
                    noindex (hide from search engines)
                  </span>
                </label>

                {/* SEO Preview */}
                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-lg text-white/30 mb-2">
                    Google Preview
                  </p>
                  <p className="text-blue-400 text-sm font-medium truncate">
                    {metaTitle || title || "Post Title"}
                  </p>
                  <p className="text-green-400/60 text-lg truncate">
                    ondemandpsych.com/blog/{slug || "post-slug"}
                  </p>
                  <p className="text-white/40 text-lg mt-1 line-clamp-2">
                    {metaDescription || excerpt || "Post description..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Open Graph Panel */}
          <div className="bg-[#0D1B4B]/60 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowOg(!showOg)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-white text-sm font-semibold flex items-center gap-2">
                <Share2 size={14} className="text-[#FDB02F]" />
                Social Sharing (OG)
              </span>
              {showOg ? (
                <ChevronUp size={16} className="text-white/40" />
              ) : (
                <ChevronDown size={16} className="text-white/40" />
              )}
            </button>

            {showOg && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                <div>
                  <label className="block text-white/40 text-lg mb-1">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={(e) => setOgTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                    placeholder={title || "Defaults to post title"}
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-lg mb-1">
                    OG Description
                  </label>
                  <textarea
                    value={ogDescription}
                    onChange={(e) => setOgDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50 resize-y"
                    placeholder={excerpt || "Defaults to excerpt"}
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-lg mb-1">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FDB02F]/50"
                    placeholder="https://..."
                  />
                </div>

                {/* Social Preview */}
                <div className="mt-3 rounded-lg border border-white/10 overflow-hidden">
                  <div className="h-32 bg-white/5 flex items-center justify-center">
                    {ogImage ? (
                      <img
                        src={ogImage}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Globe
                        size={32}
                        className="text-white/10"
                      />
                    )}
                  </div>
                  <div className="p-3 bg-white/5">
                    <p className="text-white/30 text-base uppercase">
                      ondemandpsych.com
                    </p>
                    <p className="text-white text-lg font-medium mt-0.5 truncate">
                      {ogTitle || title || "Post Title"}
                    </p>
                    <p className="text-white/40 text-lg mt-0.5 line-clamp-2">
                      {ogDescription || excerpt || "Post description..."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
