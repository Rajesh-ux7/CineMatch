"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  TrendingUp,
  Star,
  Play,
  ChevronRight,
  Zap,
  Sparkles,
  Film,
} from "lucide-react";
import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import CineAssistant from "../components/CineAssistant";
import { useEffectiveSessionId } from "../utils/session";

const IMG_BASE = "https://image.tmdb.org/t/p/original";

export default function HomePage() {
  const sessionId = useEffectiveSessionId();
  const qc = useQueryClient();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => fetch("/api/movies/trending").then((r) => r.json()),
    enabled: true,
  });

  const { data: topRated } = useQuery({
    queryKey: ["trending-day"],
    queryFn: () =>
      fetch("/api/movies/trending?timeWindow=day").then((r) => r.json()),
  });

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

  const favMut = useMutation({
    mutationFn: async (movie) => {
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

  const heroMovies = trending?.results?.slice(0, 5) || [];
  const heroMovie = heroMovies[heroIndex];

  useEffect(() => {
    if (heroMovies.length < 2) return;
    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % heroMovies.length),
      6000,
    );
    return () => clearInterval(t);
  }, [heroMovies.length]);

  useEffect(() => {
    setHeroLoaded(false);
  }, [heroIndex]);

  const genres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 16, name: "Animation" },
    { id: 18, name: "Drama" },
  ];

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Header activePage="/" />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ height: "92vh", minHeight: 520 }}
      >
        {/* Background Image */}
        {heroMovie?.backdrop_path && (
          <>
            <img
              src={`${IMG_BASE}${heroMovie.backdrop_path}`}
              alt=""
              onLoad={() => setHeroLoaded(true)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                opacity: heroLoaded ? 1 : 0,
                transition: "opacity 0.8s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(10,10,10,0.95) 30%, rgba(10,10,10,0.4) 70%, rgba(10,10,10,0.1) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(10,10,10,1) 0%, transparent 50%)",
              }}
            />
          </>
        )}

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-20">
          {heroMovie ? (
            <>
              {/* Tag */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(37,99,235,0.15)",
                    border: "1px solid rgba(37,99,235,0.3)",
                    color: "#60A5FA",
                  }}
                >
                  <TrendingUp size={10} />
                  Trending Now
                </div>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#9CA3AF",
                  }}
                >
                  <Star size={9} fill="#FBBF24" color="#FBBF24" />
                  {heroMovie.vote_average?.toFixed(1)} ·{" "}
                  {heroMovie.release_date?.substring(0, 4)}
                </div>
              </div>

              {/* Title */}
              <h1
                className="font-semibold text-white mb-3 max-w-xl leading-tight"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                {heroMovie.title}
              </h1>

              {/* Overview */}
              <p className="text-sm text-gray-400 max-w-lg mb-6 leading-relaxed line-clamp-3">
                {heroMovie.overview}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={`/movie/${heroMovie.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors duration-100"
                  style={{ backgroundColor: "#2563EB", textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1D4ED8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2563EB")
                  }
                >
                  <Play size={14} fill="white" />
                  View Details
                </a>
                <a
                  href="/search"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-100"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#F9FAFB",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.08)")
                  }
                >
                  <Search size={14} />
                  Explore
                </a>
              </div>

              {/* Hero dots */}
              <div className="flex items-center gap-2 mt-6">
                {heroMovies.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    style={{
                      width: i === heroIndex ? 24 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        i === heroIndex ? "#2563EB" : "rgba(255,255,255,0.2)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="h-4 bg-[#1F1F1F] rounded-full w-32" />
              <div className="h-12 bg-[#1F1F1F] rounded-xl w-80" />
              <div className="h-3 bg-[#1F1F1F] rounded-full w-96" />
              <div className="h-3 bg-[#1F1F1F] rounded-full w-72" />
            </div>
          )}
        </div>
      </section>

      {/* Search CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-12">
        <a
          href="/search"
          className="flex items-center gap-4 p-4 rounded-xl group transition-all duration-150"
          style={{
            backgroundColor: "#141414",
            border: "1px solid #2A2A2A",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3A3A3A")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{
              backgroundColor: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <Sparkles size={18} color="#2563EB" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Discover movies you'll love
            </p>
            <p className="text-xs text-gray-500">
              Search by title, genre, actor or director
            </p>
          </div>
          <div className="ml-auto">
            <ChevronRight size={16} color="#6B7280" />
          </div>
        </a>
      </section>

      {/* Genre Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <h2
          className="text-base font-semibold text-white mb-4"
          style={{ letterSpacing: "-0.02em" }}
        >
          Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((g) => (
            <a
              key={g.id}
              href={`/search?genre=${g.id}&genreName=${g.name}`}
              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-100"
              style={{
                backgroundColor: "#141414",
                border: "1px solid #2A2A2A",
                color: "#9CA3AF",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
                e.currentTarget.style.color = "#60A5FA";
                e.currentTarget.style.backgroundColor = "rgba(37,99,235,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2A2A2A";
                e.currentTarget.style.color = "#9CA3AF";
                e.currentTarget.style.backgroundColor = "#141414";
              }}
            >
              {g.name}
            </a>
          ))}
        </div>
      </section>

      {/* Trending This Week */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="text-base font-semibold text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Trending This Week
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Most-watched films right now
            </p>
          </div>
          <a
            href="/search"
            className="flex items-center gap-1 text-xs font-medium transition-colors duration-100"
            style={{ color: "#2563EB", textDecoration: "none" }}
          >
            See all <ChevronRight size={12} />
          </a>
        </div>

        {trendingLoading ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
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
            {(trending?.results || []).slice(0, 12).map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchlist={watchlistMut.mutate}
                onFavorite={favMut.mutate}
                inWatchlist={watchlistIds.has(movie.id)}
                inFavorites={favoriteIds.has(movie.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Today's Picks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="text-base font-semibold text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Today's Picks
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Trending in the last 24 hours
            </p>
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
              color: "#60A5FA",
            }}
          >
            <Zap size={9} />
            Live
          </div>
        </div>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          }}
        >
          {(topRated?.results || []).slice(0, 8).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onWatchlist={watchlistMut.mutate}
              onFavorite={favMut.mutate}
              inWatchlist={watchlistIds.has(movie.id)}
              inFavorites={favoriteIds.has(movie.id)}
            />
          ))}
        </div>
      </section>

      {/* Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl"
          style={{ border: "1px solid #2A2A2A", backgroundColor: "#2A2A2A" }}
        >
          {[
            {
              label: "Movies Indexed",
              value: "500K+",
              icon: <Film size={14} />,
            },
            {
              label: "AI Model",
              value: "Gemini 2.5",
              icon: <Sparkles size={14} />,
            },
            { label: "Genres Covered", value: "19+", icon: <Star size={14} /> },
            {
              label: "Recommendation Score",
              value: "ML-Powered",
              icon: <TrendingUp size={14} />,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-6 px-4 text-center"
              style={{ backgroundColor: "#141414" }}
            >
              <div className="text-gray-500 mb-2">{s.icon}</div>
              <p
                className="text-lg font-semibold text-white"
                style={{ letterSpacing: "-0.02em" }}
              >
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] py-8 px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Film size={14} color="#2563EB" />
          <span className="text-sm font-semibold text-white">CineMatch AI</span>
        </div>
        <p className="text-xs text-gray-600">
          Powered by TMDB · AI recommendations by Gemini
        </p>
      </footer>

      <CineAssistant />
    </div>
  );
}
