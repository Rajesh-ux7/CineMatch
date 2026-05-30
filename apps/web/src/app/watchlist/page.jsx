"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Heart,
  Trash2,
  Star,
  Film,
  ExternalLink,
} from "lucide-react";
import Header from "../../components/Header";
import CineAssistant from "../../components/CineAssistant";
import { useEffectiveSessionId } from "../../utils/session";

const IMG_BASE = "https://image.tmdb.org/t/p/w185";

function MovieListItem({ movie, onRemove, type }) {
  const [hovered, setHovered] = useState(false);
  const year = type === "watchlist" ? movie.movie_year : movie.movie_year;
  const title = movie.movie_title;
  const poster = movie.movie_poster;
  const rating = movie.movie_rating;

  return (
    <div
      className="flex items-center gap-4 p-3 rounded-xl transition-all duration-100"
      style={{
        backgroundColor: hovered ? "#1A1A1A" : "#141414",
        border: `1px solid ${hovered ? "#3A3A3A" : "#2A2A2A"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster */}
      <a
        href={`/movie/${movie.movie_id}`}
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <div
          className="w-12 h-16 rounded-lg overflow-hidden"
          style={{ backgroundColor: "#1F1F1F" }}
        >
          {poster ? (
            <img
              src={`${IMG_BASE}${poster}`}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film size={16} color="#4B5563" />
            </div>
          )}
        </div>
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <a href={`/movie/${movie.movie_id}`} style={{ textDecoration: "none" }}>
          <p className="text-sm font-semibold text-white truncate hover:text-blue-400 transition-colors duration-100">
            {title}
          </p>
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          {year && <span className="text-xs text-gray-500">{year}</span>}
          {rating && (
            <div
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: "#1F1F1F",
                border: "1px solid #2A2A2A",
                color: "#9CA3AF",
              }}
            >
              <Star size={9} fill="#FBBF24" color="#FBBF24" />
              {parseFloat(rating).toFixed(1)}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-0.5">
          Added{" "}
          {new Date(movie.added_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`/movie/${movie.movie_id}`}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
          style={{
            backgroundColor: "#1F1F1F",
            border: "1px solid #2A2A2A",
            color: "#6B7280",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F9FAFB";
            e.currentTarget.style.borderColor = "#3A3A3A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
            e.currentTarget.style.borderColor = "#2A2A2A";
          }}
        >
          <ExternalLink size={13} />
        </a>
        <button
          onClick={() => onRemove(movie.movie_id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-100"
          style={{
            backgroundColor: "#1F1F1F",
            border: "1px solid #2A2A2A",
            color: "#6B7280",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.1)";
            e.currentTarget.style.borderColor = "rgba(220,38,38,0.3)";
            e.currentTarget.style.color = "#F87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1F1F1F";
            e.currentTarget.style.borderColor = "#2A2A2A";
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const sessionId = useEffectiveSessionId();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("watchlist");

  const { data: watchlistData, isLoading: wLoading } = useQuery({
    queryKey: ["watchlist", sessionId],
    queryFn: () =>
      fetch(`/api/watchlist?sessionId=${sessionId}`).then((r) => r.json()),
    enabled: !!sessionId,
  });

  const { data: favoritesData, isLoading: fLoading } = useQuery({
    queryKey: ["favorites", sessionId],
    queryFn: () =>
      fetch(`/api/favorites?sessionId=${sessionId}`).then((r) => r.json()),
    enabled: !!sessionId,
  });

  const { data: ratingsData } = useQuery({
    queryKey: ["all-ratings", sessionId],
    queryFn: () =>
      fetch(`/api/ratings?sessionId=${sessionId}`).then((r) => r.json()),
    enabled: !!sessionId,
  });

  const removeWatchlist = useMutation({
    mutationFn: (movieId) =>
      fetch(`/api/watchlist?sessionId=${sessionId}&movieId=${movieId}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries(["watchlist", sessionId]),
  });

  const removeFavorite = useMutation({
    mutationFn: (movieId) =>
      fetch(`/api/favorites?sessionId=${sessionId}&movieId=${movieId}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries(["favorites", sessionId]),
  });

  const watchlist = watchlistData?.items || [];
  const favorites = favoritesData?.items || [];
  const userRatings = ratingsData?.ratings || [];

  const tabs = [
    {
      id: "watchlist",
      label: "Watchlist",
      icon: <Bookmark size={13} />,
      count: watchlist.length,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart size={13} />,
      count: favorites.length,
    },
    {
      id: "ratings",
      label: "My Ratings",
      icon: <Star size={13} />,
      count: userRatings.length,
    },
  ];

  const isLoading = wLoading || fLoading;

  const EmptyState = ({ icon, title, sub, href, cta }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-gray-500 mb-4">{sub}</p>
      <a
        href={href}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#2563EB", textDecoration: "none" }}
      >
        {cta}
      </a>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Header activePage="/watchlist" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-semibold text-white mb-1"
            style={{ letterSpacing: "-0.03em" }}
          >
            My Library
          </h1>
          <p className="text-sm text-gray-500">
            Your saved movies, favorites, and ratings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1F1F1F] mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 pb-3 text-sm font-medium transition-colors duration-100"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === tab.id ? "#F9FAFB" : "#6B7280",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid #2563EB"
                      : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="inline-flex items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      width: 18,
                      height: 18,
                      backgroundColor:
                        activeTab === tab.id ? "#2563EB" : "#1F1F1F",
                      color: activeTab === tab.id ? "white" : "#6B7280",
                      fontSize: 10,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ backgroundColor: "#141414" }}
              />
            ))}
          </div>
        ) : activeTab === "watchlist" ? (
          watchlist.length > 0 ? (
            <div className="space-y-2">
              {watchlist.map((m) => (
                <MovieListItem
                  key={m.id}
                  movie={m}
                  type="watchlist"
                  onRemove={removeWatchlist.mutate}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🎬"
              title="Your watchlist is empty"
              sub="Save movies to watch later"
              href="/search"
              cta="Browse Movies"
            />
          )
        ) : activeTab === "favorites" ? (
          favorites.length > 0 ? (
            <div className="space-y-2">
              {favorites.map((m) => (
                <MovieListItem
                  key={m.id}
                  movie={m}
                  type="favorites"
                  onRemove={removeFavorite.mutate}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="❤️"
              title="No favorites yet"
              sub="Heart movies you love to save them here"
              href="/search"
              cta="Discover Movies"
            />
          )
        ) : userRatings.length > 0 ? (
          <div className="space-y-2">
            {userRatings.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 p-3 rounded-xl"
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid #2A2A2A",
                }}
              >
                <a
                  href={`/movie/${r.movie_id}`}
                  className="flex-1 min-w-0"
                  style={{ textDecoration: "none" }}
                >
                  <p className="text-sm font-semibold text-white truncate">
                    {r.movie_title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(r.rated_at).toLocaleDateString()}
                  </p>
                </a>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      fill={parseFloat(r.rating) >= s ? "#FBBF24" : "none"}
                      color={parseFloat(r.rating) >= s ? "#FBBF24" : "#4B5563"}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {r.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="⭐"
            title="No ratings yet"
            sub="Rate movies on their detail pages"
            href="/search"
            cta="Find Movies to Rate"
          />
        )}
      </div>

      <CineAssistant />
    </div>
  );
}
