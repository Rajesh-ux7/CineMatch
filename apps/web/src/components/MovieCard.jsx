import { useState } from "react";
import { Star, Plus, Heart, Check } from "lucide-react";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({
  movie,
  onWatchlist,
  onFavorite,
  inWatchlist,
  inFavorites,
  showScore = false,
}) {
  const [imgErr, setImgErr] = useState(false);
  const posterUrl =
    movie.poster_path && !imgErr ? `${IMG_BASE}${movie.poster_path}` : null;
  const year = movie.release_date ? movie.release_date.substring(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

  return (
    <a
      href={`/movie/${movie.id}`}
      className="group block"
      style={{ textDecoration: "none" }}
    >
      <div
        className="relative rounded-xl overflow-hidden border border-[#2A2A2A] bg-[#141414] transition-all duration-150"
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#3A3A3A";
          e.currentTarget.style.backgroundColor = "#1C1C1C";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2A2A2A";
          e.currentTarget.style.backgroundColor = "#141414";
        }}
      >
        {/* Poster */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "2/3", backgroundColor: "#1A1A1A" }}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-end p-3"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)",
            }}
          >
            <div className="flex gap-1.5 w-full">
              {onWatchlist && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onWatchlist(movie);
                  }}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-100"
                  style={{
                    backgroundColor: inWatchlist
                      ? "rgba(37,99,235,0.9)"
                      : "rgba(255,255,255,0.15)",
                    color: "white",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {inWatchlist ? <Check size={10} /> : <Plus size={10} />}
                  <span>List</span>
                </button>
              )}
              {onFavorite && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavorite(movie);
                  }}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-100"
                  style={{
                    backgroundColor: inFavorites
                      ? "rgba(220,38,38,0.9)"
                      : "rgba(255,255,255,0.15)",
                    color: "white",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Heart size={10} fill={inFavorites ? "white" : "none"} />
                  <span>Fav</span>
                </button>
              )}
            </div>
          </div>

          {/* Similarity score badge */}
          {showScore && movie.similarity_score !== undefined && (
            <div
              className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: "rgba(37,99,235,0.9)",
                color: "white",
                backdropFilter: "blur(4px)",
              }}
            >
              {movie.similarity_score}%
            </div>
          )}

          {/* Rating badge */}
          <div
            className="absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Star size={9} fill="#FBBF24" color="#FBBF24" />
            <span className="text-xs font-medium text-white">{rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="text-sm font-semibold text-white truncate leading-tight"
            style={{ letterSpacing: "-0.01em" }}
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">{year}</span>
            {movie.genre_ids && movie.genre_ids.length > 0 && (
              <div
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: "#1F1F1F",
                  border: "1px solid #2A2A2A",
                  color: "#9CA3AF",
                }}
              >
                {movie.genre_ids.length} genres
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
