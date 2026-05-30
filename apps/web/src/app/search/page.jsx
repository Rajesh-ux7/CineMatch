"use client";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, Grid, List as ListIcon, Film } from "lucide-react";
import Header from "../../components/Header";
import MovieCard from "../../components/MovieCard";
import SkeletonCard from "../../components/SkeletonCard";
import SearchBar from "../../components/SearchBar";
import CineAssistant from "../../components/CineAssistant";
import { useEffectiveSessionId } from "../../utils/session";

function useSearchParams() {
  const [params, setParams] = useState({
    query: "",
    genre: "",
    genreName: "",
    year: "",
    sortBy: "popularity.desc",
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setParams({
      query: sp.get("q") || "",
      genre: sp.get("genre") || "",
      genreName: sp.get("genreName") || "",
      year: sp.get("year") || "",
      sortBy: sp.get("sortBy") || "popularity.desc",
    });
  }, []);
  return params;
}

export default function SearchPage() {
  const sessionId = useEffectiveSessionId();
  const urlParams = useSearchParams();
  const qc = useQueryClient();

  const [searchParams, setSearchParams] = useState({
    query: "",
    genre: "",
    year: "",
    sortBy: "popularity.desc",
  });
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setSearchParams({
      query: urlParams.query,
      genre: urlParams.genre,
      year: urlParams.year,
      sortBy: urlParams.sortBy,
    });
    setInitialized(true);
  }, [urlParams, initialized]);

  const queryKey = ["search", searchParams, page];

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const sp = new URLSearchParams({ ...searchParams, page, sessionId });
      const r = await fetch(`/api/movies/search?${sp}`);
      if (!r.ok) throw new Error("Search failed");
      return r.json();
    },
    enabled: initialized,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!data) return;
    if (page === 1) {
      setAllMovies(data.results || []);
    } else {
      setAllMovies((prev) => [...prev, ...(data.results || [])]);
    }
    setHasMore(
      (data.page || 1) < (data.total_pages || 1) && (data.page || 1) < 10,
    );
  }, [data]);

  const handleSearch = useCallback((params) => {
    setSearchParams(params);
    setPage(1);
    setAllMovies([]);
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams();
      if (params.query) sp.set("q", params.query);
      if (params.genre) sp.set("genre", params.genre);
      if (params.year) sp.set("year", params.year);
      if (params.sortBy) sp.set("sortBy", params.sortBy);
      window.history.replaceState({}, "", `/search?${sp}`);
    }
  }, []);

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

  const hasQuery =
    searchParams.query || searchParams.genre || searchParams.year;
  const title = searchParams.query
    ? `Results for "${searchParams.query}"`
    : urlParams.genreName
      ? `${urlParams.genreName} Movies`
      : "Discover Movies";

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Header activePage="/search" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Page Title */}
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-white mb-1"
            style={{ letterSpacing: "-0.03em" }}
          >
            {title}
          </h1>
          {data?.total_results !== undefined && (
            <p className="text-sm text-gray-500">
              {data.total_results.toLocaleString()} movies found
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            initialQuery={searchParams.query}
            initialGenre={searchParams.genre}
            showFilters={true}
          />
        </div>

        {/* Controls */}
        {allMovies.length > 0 && (
          <div className="flex items-center justify-between mb-5">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
              style={{
                backgroundColor: "#141414",
                border: "1px solid #2A2A2A",
                color: "#6B7280",
              }}
            >
              <SlidersHorizontal size={10} />
              {allMovies.length} shown
            </div>
            <div
              className="flex items-center gap-1 p-1 rounded-lg"
              style={{
                backgroundColor: "#141414",
                border: "1px solid #2A2A2A",
              }}
            >
              {[
                ["grid", <Grid size={13} />],
                ["list", <ListIcon size={13} />],
              ].map(([mode, icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="p-1.5 rounded-md transition-colors duration-100"
                  style={{
                    backgroundColor:
                      viewMode === mode ? "#2A2A2A" : "transparent",
                    color: viewMode === mode ? "#F9FAFB" : "#6B7280",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {isLoading && page === 1 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : allMovies.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                }}
              >
                {allMovies.map((movie) => (
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
            ) : (
              <div className="space-y-2">
                {allMovies.map((movie) => (
                  <a
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all duration-100"
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid #2A2A2A",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = "#3A3A3A")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = "#2A2A2A")
                    }
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          : ""
                      }
                      alt={movie.title}
                      className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
                      style={{ backgroundColor: "#1F1F1F" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {movie.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {movie.release_date?.substring(0, 4)} · ⭐{" "}
                        {movie.vote_average?.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {movie.overview}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="px-8 py-3 rounded-xl text-sm font-semibold transition-colors duration-100"
                  style={{
                    backgroundColor: "#141414",
                    border: "1px solid #2A2A2A",
                    color: isFetching ? "#4B5563" : "#F9FAFB",
                  }}
                  onMouseEnter={(e) => {
                    if (!isFetching)
                      e.currentTarget.style.borderColor = "#3A3A3A";
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#2A2A2A")
                  }
                >
                  {isFetching ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : initialized && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-base font-semibold text-white mb-1">
              No movies found
            </p>
            <p className="text-sm text-gray-500">
              Try a different search or adjust your filters
            </p>
          </div>
        ) : null}
      </div>

      <CineAssistant />
    </div>
  );
}
