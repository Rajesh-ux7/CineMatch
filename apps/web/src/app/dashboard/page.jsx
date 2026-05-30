"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart2,
  Film,
  Heart,
  Bookmark,
  Eye,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import Header from "../../components/Header";
import CineAssistant from "../../components/CineAssistant";
import { useEffectiveSessionId } from "../../utils/session";

const PIE_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#EA580C",
  "#059669",
  "#DC2626",
  "#D97706",
  "#0891B2",
  "#BE185D",
  "#65A30D",
  "#9333EA",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs"
      style={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #2A2A2A",
        color: "#F9FAFB",
      }}
    >
      <p className="font-semibold">{label || payload[0]?.name}</p>
      <p className="text-gray-400">{payload[0]?.value}</p>
    </div>
  );
};

function StatCard({ icon, label, value, sub }) {
  return (
    <div
      className="p-5 rounded-xl"
      style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{
            backgroundColor: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          {icon}
        </div>
      </div>
      <p
        className="text-2xl font-semibold text-white"
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </p>
      <p className="text-sm font-medium text-white mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const sessionId = useEffectiveSessionId();

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/analytics?sessionId=${sessionId}`);
      if (!r.ok) throw new Error("Failed to load analytics");
      return r.json();
    },
    enabled: !!sessionId,
  });

  const { data: recentlyViewed } = useQuery({
    queryKey: ["recently-viewed", sessionId],
    queryFn: () =>
      fetch(`/api/recently-viewed?sessionId=${sessionId}&limit=10`).then((r) =>
        r.json(),
      ),
    enabled: !!sessionId,
  });

  const { data: ratings } = useQuery({
    queryKey: ["all-ratings", sessionId],
    queryFn: () =>
      fetch(`/api/ratings?sessionId=${sessionId}`).then((r) => r.json()),
    enabled: !!sessionId,
  });

  const genreData = (data?.genreStats || []).map((g) => ({
    name: g.genre_name,
    value: parseInt(g.view_count),
  }));
  const ratingDist = (data?.ratingDistribution || []).map((r) => ({
    name: `${r.rating}★`,
    value: r.count,
  }));
  const searchHistory = (data?.searchStats || []).slice(0, 10).map((s) => ({
    name: s.query.length > 12 ? s.query.substring(0, 12) + "…" : s.query,
    results: s.results_count,
  }));

  const hasData =
    data &&
    (data.moviesViewed > 0 ||
      data.totalSearches > 0 ||
      data.watchlistCount > 0);

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Header activePage="/dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-semibold text-white mb-1"
              style={{ letterSpacing: "-0.03em" }}
            >
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Your personal movie activity & preferences
            </p>
          </div>
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
              color: "#60A5FA",
            }}
          >
            <BarChart2 size={11} />
            Session Analytics
          </div>
        </div>

        {!hasData && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-base font-semibold text-white mb-1">
              No activity yet
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Browse movies, rate them, and add to watchlist to see your stats
              here
            </p>
            <a
              href="/"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#2563EB", textDecoration: "none" }}
            >
              Discover Movies
            </a>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Eye size={16} color="#2563EB" />}
                label="Movies Viewed"
                value={data?.moviesViewed || 0}
                sub="this session"
              />
              <StatCard
                icon={<Search size={16} color="#2563EB" />}
                label="Searches Made"
                value={data?.totalSearches || 0}
                sub="this session"
              />
              <StatCard
                icon={<Bookmark size={16} color="#2563EB" />}
                label="In Watchlist"
                value={data?.watchlistCount || 0}
                sub="movies saved"
              />
              <StatCard
                icon={<Heart size={16} color="#2563EB" />}
                label="Favorites"
                value={data?.favoritesCount || 0}
                sub="movies loved"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Genre Breakdown */}
              {genreData.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Genre Preferences
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Based on movies you've viewed
                      </p>
                    </div>
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                      style={{
                        backgroundColor: "rgba(37,99,235,0.08)",
                        border: "1px solid rgba(37,99,235,0.15)",
                        color: "#60A5FA",
                      }}
                    >
                      <TrendingUp size={9} />
                      ML Analysis
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={genreData.slice(0, 8)}
                      layout="vertical"
                      margin={{ left: 0, right: 10 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                        width={80}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {genreData.slice(0, 8).map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Genre Pie */}
              {genreData.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-white">
                      Genre Distribution
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Breakdown by viewing frequency
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={genreData.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {genreData.slice(0, 6).map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {genreData.slice(0, 5).map((g, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                              flexShrink: 0,
                            }}
                          />
                          <span className="text-xs text-gray-400 truncate">
                            {g.name}
                          </span>
                          <span className="text-xs text-gray-600 ml-auto">
                            {g.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Rating Distribution */}
              {ratingDist.some((r) => r.value > 0) && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-white">
                      Your Rating Pattern
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Distribution of your movie ratings
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={ratingDist}>
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#2563EB"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">
                      Recent Searches
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your search activity
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {(data?.searchStats || []).slice(0, 6).map((s, i) => (
                      <a
                        key={i}
                        href={`/search?q=${encodeURIComponent(s.query)}`}
                        className="flex items-center justify-between p-2.5 rounded-lg transition-colors duration-100"
                        style={{ textDecoration: "none" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#1A1A1A")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">-</span>
                          <span className="text-sm text-gray-300">
                            {s.query}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {s.results_count?.toLocaleString()} results
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recently Viewed */}
            {(recentlyViewed?.items || []).length > 0 && (
              <div
                className="p-5 rounded-xl"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #2A2A2A",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Recently Viewed
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Movies you've explored this session
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {(recentlyViewed.items || []).map((m) => (
                    <a
                      key={m.id}
                      href={`/movie/${m.movie_id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        className="rounded-xl overflow-hidden transition-all duration-100"
                        style={{ border: "1px solid #2A2A2A" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "#3A3A3A")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "#2A2A2A")
                        }
                      >
                        <div
                          style={{
                            aspectRatio: "2/3",
                            backgroundColor: "#1A1A1A",
                          }}
                        >
                          {m.movie_poster ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${m.movie_poster}`}
                              alt={m.movie_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film size={16} color="#4B5563" />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-400 mt-1 truncate">
                        {m.movie_title}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CineAssistant />
    </div>
  );
}
