"use client";

import { useEffect, useState } from "react";
import { FileText, Layers, MessageSquare, Clock, Zap, ThumbsUp, ThumbsDown, FolderOpen, Shield } from "lucide-react";

const BASIC_CATEGORIES = [
  "appsanddevices", "treatmentprotocol", "medication", "sideeffects", "labmonitoring",
  "tapering", "diagnosis", "patienteducation", "psychotherapy", "mentalstatusexam",
  "assessment", "ratingscales", "erdisposition", "questions", "teachingpoints",
  "references", "generalinformation", "dietaryandherbals", "links",
];

const ADVANCED_ONLY_CATEGORIES = [
  "billingandcoding", "complexcases", "documentation", "druginteractions", "guidelines",
  "letters", "nofdaapproved", "preauthorization", "riskassessment",
  "somaticorinvasiveinterventions", "functionalimpairmentanddisabilitysupport",
  "ethicalandlegal", "settings", "dischargeplanningandcontinuityofcare",
  "administrativesupervisoryandteaching", "childandadolescentpsychiatry",
  "emergencypsychiatry", "followupandrelapseprevention", "geriatricpsychiatry",
  "inpatientpsychiatry", "integratedcareandcollaborativepsychiatry",
  "ismytreatmentright", "outpatientpsychiatry", "pharmacogenomicsandprecisionmedicine",
  "psychiatricevaluations", "psychiatricrehabilitationandfunctionalrecovery",
  "psychiatricresearchtrainingandcontinuingeducation", "qualityassuranceauditandpeerreview",
  "substanceabuseandaddictionpsychiatry", "telepsychiatryanddigitalpracticestandards",
  "medicalemergenciesonthepsychiatricunit", "educationmaterialsandlearningresources",
  "billingoptimizationandrevenuecycleinpsychiatry", "neuropsychiatricandcognitivedisorders",
  "psychotherapynote", "sleepdisordersandinsomniamanagement",
  "substanceusedisordersanddualdiagnosis", "traumaptsdandstressorrelateddisorders",
];

const PREMIUM_ONLY_CATEGORIES = [
  "drugseekingbehavior", "miscellaneousquestions", "summary", "finalrecommendation",
];

function getPlanTier(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (BASIC_CATEGORIES.includes(lower)) return "Basic";
  if (ADVANCED_ONLY_CATEGORIES.includes(lower)) return "Advanced";
  if (PREMIUM_ONLY_CATEGORIES.includes(lower)) return "Premium";
  return "Unassigned";
}

function getTierColor(tier: string): string {
  switch (tier) {
    case "Basic": return "bg-green-500/15 text-green-400 border-green-500/30";
    case "Advanced": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "Premium": return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    default: return "bg-red-500/15 text-red-400 border-red-500/30";
  }
}

interface CategoryStat {
  name: string;
  chunk_count: number;
  document_count?: number;
}

interface Analytics {
  totalDocuments: number;
  indexedDocs: number;
  failedDocs: number;
  totalChunks: number;
  totalCategories: number;
  totalQueries: number;
  avgLatencyMs: number;
  avgTokensUsed: number;
  feedbackStats: { feedback: string; _count: number }[];
  categories?: CategoryStat[];
  recentQueries: {
    id: string;
    query: string;
    chunksUsed: number;
    latencyMs: number;
    tokensUsed: number;
    feedback: string | null;
    createdAt: string;
  }[];
}

export default function RAGAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => { fetchAnalytics(); }, [days]);

  async function fetchAnalytics() {
    setLoading(true);
    const res = await fetch(`/api/admin/rag/analytics?days=${days}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  if (loading) return <div className="text-center py-12 text-white/40 text-base">Loading analytics...</div>;
  if (!data) return <div className="text-center py-12 text-red-400 text-base">Failed to load analytics</div>;

  const thumbsUp = data.feedbackStats.find((f) => f.feedback === "thumbs_up")?._count ?? 0;
  const thumbsDown = data.feedbackStats.find((f) => f.feedback === "thumbs_down")?._count ?? 0;

  const stats = [
    { icon: FileText, label: "Documents", value: data.totalDocuments, sub: `${data.indexedDocs} indexed · ${data.failedDocs} failed` },
    { icon: Layers, label: "Chunks", value: data.totalChunks.toLocaleString(), sub: "Total indexed chunks" },
    { icon: FolderOpen, label: "Categories", value: data.totalCategories || 0, sub: `${data.totalCategories || 0} with documents` },
    { icon: MessageSquare, label: "Queries", value: data.totalQueries, sub: `Last ${days} days` },
    { icon: Clock, label: "Avg Latency", value: `${data.avgLatencyMs}ms`, sub: "Per query" },
    { icon: ThumbsUp, label: "Feedback", value: `${thumbsUp} / ${thumbsDown}`, sub: "Positive / Negative" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">RAG Analytics</h1>
          <p className="text-base text-white/50 mt-1">Monitor knowledge base performance</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 rounded-lg bg-[#0D1B4B] border border-white/10 text-white text-base focus:border-[#FDB02F]/50 focus:outline-none"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-[#0D1B4B]/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={18} className="text-[#FDB02F]" />
              <span className="text-base text-white/50">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
            <p className="text-base text-white/30 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Categories breakdown by plan tier */}
      {(() => {
        // Merge DO API categories (with chunks) with full plan category list
        const catMap = new Map<string, { chunk_count: number; document_count?: number }>();
        (data.categories || []).forEach((cat: CategoryStat) => {
          catMap.set(cat.name.toLowerCase(), { chunk_count: cat.chunk_count, document_count: cat.document_count });
        });

        // Build full list: all plan categories + any DO categories not in plans
        const allCategories: CategoryStat[] = [];
        const seen = new Set<string>();

        [...BASIC_CATEGORIES, ...ADVANCED_ONLY_CATEGORIES, ...PREMIUM_ONLY_CATEGORIES].forEach((name) => {
          if (!seen.has(name)) {
            seen.add(name);
            const stats = catMap.get(name);
            allCategories.push({ name, chunk_count: stats?.chunk_count ?? 0, document_count: stats?.document_count });
          }
        });

        // Add any DO categories not in our plan lists
        (data.categories || []).forEach((cat: CategoryStat) => {
          const lower = cat.name.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            allCategories.push({ name: lower, chunk_count: cat.chunk_count, document_count: cat.document_count });
          }
        });

        const grouped = { Basic: [] as CategoryStat[], Advanced: [] as CategoryStat[], Premium: [] as CategoryStat[], Unassigned: [] as CategoryStat[] };
        allCategories.forEach((cat) => {
          const tier = getPlanTier(cat.name);
          grouped[tier as keyof typeof grouped].push(cat);
        });

        const totalCategories = allCategories.length;
        const withDocs = allCategories.filter((c) => c.chunk_count > 0).length;

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-white">Categories ({totalCategories})</h2>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/50">{withDocs} with documents · {totalCategories - withDocs} empty</span>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/15 text-green-400">Basic: {grouped.Basic.length}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-400">Advanced: {grouped.Advanced.length}</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/15 text-purple-400">Premium: {grouped.Premium.length}</span>
                {grouped.Unassigned.length > 0 && <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/15 text-red-400">Unassigned: {grouped.Unassigned.length}</span>}
              </div>
            </div>

            {(["Basic", "Advanced", "Premium", "Unassigned"] as const).map((tier) => {
              const cats = grouped[tier];
              if (cats.length === 0) return null;
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} className={tier === "Basic" ? "text-green-400" : tier === "Advanced" ? "text-blue-400" : tier === "Premium" ? "text-purple-400" : "text-red-400"} />
                    <h3 className="text-base font-semibold text-white">{tier} Plan Categories ({cats.length})</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {cats.map((cat) => {
                      const catTier = getPlanTier(cat.name);
                      const isEmpty = cat.chunk_count === 0;
                      return (
                        <div key={cat.name} className={`rounded-xl border p-3 ${isEmpty ? "border-white/5 bg-[#0D1B4B]/25 opacity-60" : "border-white/10 bg-[#0D1B4B]/50"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-base font-medium text-white capitalize truncate">
                              {cat.name.replace(/([A-Z])/g, " $1").replace(/and/gi, " & ").trim()}
                            </p>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getTierColor(catTier)}`}>
                              {catTier}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div>
                              <p className={`text-lg font-bold font-mono ${isEmpty ? "text-white/20" : "text-[#FDB02F]"}`}>
                                {isEmpty ? "—" : cat.chunk_count.toLocaleString()}
                              </p>
                              <p className="text-xs text-white/30">chunks</p>
                            </div>
                            {!isEmpty && cat.document_count != null && (
                              <div className="border-l border-white/10 pl-3">
                                <p className="text-lg font-bold font-mono text-white/70">
                                  {cat.document_count.toLocaleString()}
                                </p>
                                <p className="text-xs text-white/30">docs</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Recent queries */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Queries</h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#0D1B4B]/50">
                <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Query</th>
                <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Chunks</th>
                <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Latency</th>
                <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Tokens</th>
                <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Feedback</th>
                <th className="text-left px-4 py-3 text-base font-semibold text-white/50">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentQueries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-white/40 text-base">No queries yet</td>
                </tr>
              ) : (
                data.recentQueries.map((q) => (
                  <tr key={q.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-base text-white/70 max-w-xs truncate">{q.query}</td>
                    <td className="px-4 py-3 text-base text-white/50">{q.chunksUsed}</td>
                    <td className="px-4 py-3 text-base text-white/50">{q.latencyMs}ms</td>
                    <td className="px-4 py-3 text-base text-white/50">{q.tokensUsed}</td>
                    <td className="px-4 py-3">
                      {q.feedback === "thumbs_up" && <ThumbsUp size={16} className="text-green-400" />}
                      {q.feedback === "thumbs_down" && <ThumbsDown size={16} className="text-red-400" />}
                      {!q.feedback && <span className="text-base text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-3 text-base text-white/40">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
