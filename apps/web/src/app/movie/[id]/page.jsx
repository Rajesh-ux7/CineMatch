"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Clock,
  Calendar,
  Bookmark,
  Heart,
  Play,
  ChevronRight,
  Check,
  Users,
  TrendingUp,
} from "lucide-react";
import Header from "../../../components/Header";
import MovieCard from "../../../components/MovieCard";
import SkeletonCard from "../../../components/SkeletonCard";
import CineAssistant from "../../../components/CineAssistant";
import { useEffectiveSessionId } from "../../../utils/session";

const IMG_BASE_W500 = "https://image.tmdb.org/t/p/w500";
const IMG_BASE_ORIG = "https://image.tmdb.org/t/p/original";

function StarRating({ value, onChange, readOnly }) {
  const [hovered, setHovered] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          disabled={readOnly}
          onClick={() => onChange && onChange(s)}
          onMouseEnter={() => !readOnly && setHovered(s)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            background: "none",
            border: "none",
            cursor: readOnly ? "default" : "pointer",
            padding: 0,
          }}
        >
          <Star
            size={18}
            fill={(hovered || value) >= s ? "#FBBF24" : "none"}
            color={(hovered || value) >= s ? "#FBBF24" : "#4B5563"}
          />
        </button>
      ))}
    </div>
  );
}

function CircularProgress({ percent, label }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div className="relative flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#1F1F1F"
          strokeWidth="3"
        />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
        <text
          x="26"
          y="31"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#F9FAFB"
        >
          {percent}%
        </text>
      </svg>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default function MovieDetailPage({ params: { id } }) {
  const sessionId = useEffectiveSessionId();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [userRating, setUserRating] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["movie", id, sessionId],
    queryFn: async () => {
      const r = await fetch(`/api/movies/${id}?sessionId=${sessionId}`);
      if (!r.ok) throw new Error("Movie not found");
      return r.json();
    },
    enabled: !!id,
  });

  const { data: recData, isLoading: recLoading } = useQuery({
    queryKey: ["recommendations", id],
    queryFn: () =>
      fetch(`/api/movies/${id}/recommendations`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: ratingData } = useQuery({
    queryKey: ["rating", id, sessionId],
    queryFn: () =>
      fetch(`/api/ratings?sessionId=${sessionId}&movieId=${id}`).then((r) =>
        r.json(),
      ),
    enabled: !!sessionId && !!id,
    onSuccess: (d) => {
      if (d?.rating?.rating) setUserRating(parseInt(d.rating.rating));
    },
  });

  useEffect(() => {
    if (ratingData?.rating?.rating)
      setUserRating(Math.round(parseFloat(ratingData.rating.rating)));
  }, [ratingData]);

  const { data: watchlistData } = useQuery({
    queryKey: ["watchlist", sessionId],
    queryFn: () =>
      fetch(`/api/watchlist?sessionId=${sessionId}`).then((r) => r.json()),
    enabled: !!sessionId,
  });
  const { data: favoritesData } = useQuery({
    queryKey: ["favorites", sessionId],
    queryFn: () =>
      fetch(`/api/favorites?sessionId=${sessionId}`).then((r) => r.json()),
    enabled: !!sessionId,
  });

  const watchlistIds = new Set(
    (watchlistData?.items || []).map((i) => i.movie_id),
  );
  const favoriteIds = new Set(
    (favoritesData?.items || []).map((i) => i.movie_id),
  );

  const watchlistMut = useMutation({
    mutationFn: async () => {
      const movie = data?.movie;
      if (!movie) return;
      if (watchlistIds.has(movie.id)) {
        await fetch(
          `/api/watchlist?sessionId=${sessionId}&movieId=${movie.id}`,
          { method: "DELETE" },
        );
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            movieId: movie.id,
            movieTitle: movie.title,
            moviePoster: movie.poster_path,
            movieYear: movie.release_date?.substring(0, 4),
            movieRating: movie.vote_average,
          }),
        });
      }
    },
    onSuccess: () => qc.invalidateQueries(["watchlist", sessionId]),
  });

  const favMut = useMutation({
    mutationFn: async () => {
      const movie = data?.movie;
      if (!movie) return;
      if (favoriteIds.has(movie.id)) {
        await fetch(
          `/api/favorites?sessionId=${sessionId}&movieId=${movie.id}`,
          { method: "DELETE" },
        );
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            movieId: movie.id,
            movieTitle: movie.title,
            moviePoster: movie.poster_path,
            movieYear: movie.release_date?.substring(0, 4),
            movieRating: movie.vote_average,
          }),
        });
      }
    },
    onSuccess: () => qc.invalidateQueries(["favorites", sessionId]),
  });

  const ratingMut = useMutation({
    mutationFn: async (r) => {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          movieId: data?.movie?.id,
          movieTitle: data?.movie?.title,
          rating: r,
        }),
      });
    },
    onSuccess: () => qc.invalidateQueries(["rating", id, sessionId]),
  });

  const watchlistMutRec = useMutation({
    mutationFn: async (movie) => {
      if (watchlistIds.has(movie.id)) {
        await fetch(
          `/api/watchlist?sessionId=${sessionId}&movieId=${movie.id}`,
          { method: "DELETE" },
        );
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            movieId: movie.id,
            movieTitle: movie.title,
            moviePoster: movie.poster_path,
            movieYear: movie.release_date?.substring(0, 4),
            movieRating: movie.vote_average,
          }),
        });
      }
    },
    onSuccess: () => qc.invalidateQueries(["watchlist", sessionId]),
  });

  const movie = data?.movie;
  const credits = data?.credits;
  const videos = data?.videos;
  const trailer =
    videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube",
    ) || videos?.results?.[0];
  const cast = credits?.cast?.slice(0, 12) || [];
  const director = credits?.crew?.find((c) => c.job === "Director");

  const tabs = ["overview", "cast", "recommendations"];

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "#0A0A0A",
          minHeight: "100vh",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24">
          <div className="flex gap-8 animate-pulse">
            <div
              className="w-52 flex-shrink-0 rounded-xl"
              style={{ aspectRatio: "2/3", backgroundColor: "#1F1F1F" }}
            />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-8 bg-[#1F1F1F] rounded-full w-64" />
              <div className="h-4 bg-[#1F1F1F] rounded-full w-40" />
              <div className="space-y-2 mt-6">
                <div className="h-3 bg-[#1F1F1F] rounded-full" />
                <div className="h-3 bg-[#1F1F1F] rounded-full w-5/6" />
                <div className="h-3 bg-[#1F1F1F] rounded-full w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div
        style={{
          backgroundColor: "#0A0A0A",
          minHeight: "100vh",
          fontFamily: '"Inter", sans-serif',
        }}
        className="flex items-center justify-center"
      >
        <Header />
        <div className="text-center mt-24">
          <p className="text-4xl mb-3">🎬</p>
          <p className="text-base font-semibold text-white">Movie not found</p>
          <a href="/" className="text-sm text-blue-500 mt-2 block">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  const year = movie.release_date?.substring(0, 4);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const inWatchlist = watchlistIds.has(movie.id);
  const inFavorites = favoriteIds.has(movie.id);
  const popularityScore = Math.min(
    Math.round((movie.popularity / 500) * 100),
    100,
  );
  const ratingScore = Math.round((movie.vote_average / 10) * 100);

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Header />

      {/* Backdrop */}
      {movie.backdrop_path && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            src={`${IMG_BASE_ORIG}${movie.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.06 }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,1) 60%)",
            }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-6">
          <a href="/" style={{ textDecoration: "none", color: "#6B7280" }}>
            Home
          </a>
          <ChevronRight size={10} />
          <span className="text-gray-400 truncate max-w-48">{movie.title}</span>
        </div>

        {/* Hero Info */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-10">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                width: 180,
                border: "1px solid #2A2A2A",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}
            >
              {movie.poster_path ? (
                <img
                  src={`${IMG_BASE_W500}${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full"
                />
              ) : (
                <div
                  style={{
                    aspectRatio: "2/3",
                    backgroundColor: "#1A1A1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="text-3xl">🎬</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #2A2A2A",
                  color: "#9CA3AF",
                }}
              >
                <Star size={9} fill="#FBBF24" color="#FBBF24" />
                {movie.vote_average?.toFixed(1)} ·{" "}
                {movie.vote_count?.toLocaleString()} votes
              </div>
              {year && (
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                    color: "#9CA3AF",
                  }}
                >
                  <Calendar size={9} />
                  {year}
                </div>
              )}
              {runtime && (
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                    color: "#9CA3AF",
                  }}
                >
                  <Clock size={9} />
                  {runtime}
                </div>
              )}
            </div>

            <h1
              className="text-3xl font-semibold text-white mb-1"
              style={{ letterSpacing: "-0.03em" }}
            >
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-sm text-gray-500 mb-3 italic">
                {movie.tagline}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(movie.genres || []).map((g) => (
                <a
                  key={g.id}
                  href={`/search?genre=${g.id}&genreName=${g.name}`}
                  className="inline-flex rounded-full px-3 py-1 text-xs font-medium transition-colors duration-100"
                  style={{
                    backgroundColor: "rgba(37,99,235,0.1)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    color: "#60A5FA",
                    textDecoration: "none",
                  }}
                >
                  {g.name}
                </a>
              ))}
            </div>

            {/* Scores */}
            <div className="flex items-center gap-6 mb-5">
              <CircularProgress percent={ratingScore} label="Rating" />
              <CircularProgress percent={popularityScore} label="Popularity" />
              {movie.vote_count > 0 && (
                <CircularProgress
                  percent={Math.min(Math.round(movie.vote_count / 100), 100)}
                  label="Votes"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {trailer && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors duration-100"
                  style={{ backgroundColor: "#2563EB" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1D4ED8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2563EB")
                  }
                >
                  <Play size={14} fill="white" />
                  Watch Trailer
                </button>
              )}
              <button
                onClick={() => watchlistMut.mutate()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-100"
                style={{
                  backgroundColor: inWatchlist
                    ? "rgba(37,99,235,0.15)"
                    : "#141414",
                  border: "1px solid",
                  borderColor: inWatchlist ? "rgba(37,99,235,0.4)" : "#2A2A2A",
                  color: inWatchlist ? "#60A5FA" : "#9CA3AF",
                }}
              >
                {inWatchlist ? <Check size={14} /> : <Bookmark size={14} />}
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
              <button
                onClick={() => favMut.mutate()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-100"
                style={{
                  backgroundColor: inFavorites
                    ? "rgba(220,38,38,0.1)"
                    : "#141414",
                  border: "1px solid",
                  borderColor: inFavorites ? "rgba(220,38,38,0.3)" : "#2A2A2A",
                  color: inFavorites ? "#F87171" : "#9CA3AF",
                }}
              >
                <Heart size={14} fill={inFavorites ? "#F87171" : "none"} />
                {inFavorites ? "Favorited" : "Favorite"}
              </button>
            </div>

            {/* Your Rating */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">
                Your Rating:
              </span>
              <StarRating
                value={userRating}
                onChange={(r) => {
                  setUserRating(r);
                  ratingMut.mutate(r);
                }}
              />
              {userRating > 0 && (
                <span className="text-xs text-gray-600">{userRating}/5</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1F1F1F] mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 text-sm font-medium capitalize transition-colors duration-100"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === tab ? "#F9FAFB" : "#6B7280",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #2563EB"
                      : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {tab === "recommendations" ? "AI Picks" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <div
                className="p-5 rounded-xl"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #2A2A2A",
                }}
              >
                <h3 className="text-sm font-semibold text-white mb-3">
                  Overview
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>
              </div>

              {/* Keywords */}
              {movie.keywords?.keywords?.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.keywords.keywords.slice(0, 15).map((k) => (
                      <span
                        key={k.id}
                        className="inline-flex rounded-full px-3 py-1 text-xs"
                        style={{
                          backgroundColor: "#1A1A1A",
                          border: "1px solid #2A2A2A",
                          color: "#9CA3AF",
                        }}
                      >
                        {k.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div
                className="p-5 rounded-xl space-y-3"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #2A2A2A",
                }}
              >
                <h3 className="text-sm font-semibold text-white">Details</h3>
                {director && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Director</p>
                    <p className="text-sm text-white">{director.name}</p>
                  </div>
                )}
                {movie.release_date && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Release Date</p>
                    <p className="text-sm text-white">
                      {new Date(movie.release_date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  </div>
                )}
                {movie.original_language && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Language</p>
                    <p className="text-sm text-white capitalize">
                      {movie.original_language}
                    </p>
                  </div>
                )}
                {movie.budget > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                    <p className="text-sm text-white">
                      ${movie.budget.toLocaleString()}
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Revenue</p>
                    <p className="text-sm text-white">
                      ${movie.revenue.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Production Companies */}
              {movie.production_companies?.length > 0 && (
                <div
                  className="p-5 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Studios
                  </h3>
                  <div className="space-y-1">
                    {movie.production_companies.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center gap-1.5">
                        <span className="text-gray-500">-</span>
                        <span className="text-sm text-gray-400">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "cast" && (
          <div>
            {director && (
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Direction
                </h3>
                <div
                  className="inline-flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: "#1F1F1F" }}
                  >
                    {director.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                        alt={director.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Users size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {director.name}
                    </p>
                    <p className="text-xs text-gray-500">Director</p>
                  </div>
                </div>
              </div>
            )}
            <h3 className="text-sm font-medium text-gray-500 mb-3">Cast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cast.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                  }}
                >
                  <div
                    className="relative"
                    style={{ aspectRatio: "2/3", backgroundColor: "#1A1A1A" }}
                  >
                    {c.profile_path ? (
                      <img
                        src={`${IMG_BASE_W500}${c.profile_path}`}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users size={24} color="#4B5563" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-white truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} color="#2563EB" />
                <span className="text-sm font-semibold text-white">
                  AI-Powered Picks
                </span>
              </div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
                style={{
                  backgroundColor: "rgba(37,99,235,0.1)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  color: "#60A5FA",
                }}
              >
                Content-based filtering · Cosine similarity
              </div>
            </div>

            {recLoading ? (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                }}
              >
                {(recData?.results || []).map((m) => (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    showScore
                    onWatchlist={watchlistMutRec.mutate}
                    inWatchlist={watchlistIds.has(m.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {trailerOpen && trailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl overflow-hidden"
            style={{ border: "1px solid #2A2A2A", aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title="Trailer"
              className="w-full h-full"
              allowFullScreen
              allow="autoplay"
            />
          </div>
        </div>
      )}

      <CineAssistant currentMovie={movie} />
    </div>
  );
}
