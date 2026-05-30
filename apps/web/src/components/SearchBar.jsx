import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function SearchBar({
  onSearch,
  initialQuery = "",
  initialGenre = "",
  showFilters = true,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [showFilter, setShowFilter] = useState(false);
  const inputRef = useRef(null);

  const { data: genreData } = useQuery({
    queryKey: ["genres"],
    queryFn: () => fetch("/api/movies/genres").then((r) => r.json()),
    staleTime: Infinity,
  });

  const genres = genreData?.genres || [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Top Rated" },
    { value: "release_date.desc", label: "Newest First" },
    { value: "release_date.asc", label: "Oldest First" },
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    if (onSearch) onSearch({ query, genre, year, sortBy });
  };

  useEffect(() => {
    if (initialQuery !== query) setQuery(initialQuery);
    if (initialGenre !== genre) setGenre(initialGenre);
  }, [initialQuery, initialGenre]);

  return (
    <form onSubmit={handleSearch} className="w-full space-y-3">
      {/* Main Search Input */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-gray-500">
          <Search size={16} />
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, directors, actors…"
          className="w-full pl-11 pr-24 py-3.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0"
          style={{
            backgroundColor: "#141414",
            border: "1px solid #2A2A2A",
            fontFamily: '"Inter", sans-serif',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2563EB";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#2A2A2A";
          }}
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-gray-500 transition-colors duration-100"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#9CA3AF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              <X size={13} />
            </button>
          )}
          {showFilters && (
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100"
              style={{
                backgroundColor: showFilter
                  ? "rgba(37,99,235,0.15)"
                  : "#1F1F1F",
                border: "1px solid",
                borderColor: showFilter ? "rgba(37,99,235,0.3)" : "#2A2A2A",
                color: showFilter ? "#60A5FA" : "#6B7280",
              }}
            >
              <Filter size={11} />
              Filters
              {(genre || year || sortBy !== "popularity.desc") && (
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: "#2563EB",
                    color: "white",
                    fontSize: 9,
                  }}
                >
                  {
                    [genre, year, sortBy !== "popularity.desc"].filter(Boolean)
                      .length
                  }
                </span>
              )}
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors duration-100"
            style={{ backgroundColor: "#2563EB" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1D4ED8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563EB")
            }
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilter && (
        <div
          className="p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3"
          style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
        >
          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Genre</label>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-white outline-none"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Year</label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-white outline-none"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Sort By</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-sm text-white outline-none"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Apply / Reset */}
          <div className="sm:col-span-3 flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: "#2563EB" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1D4ED8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#2563EB")
              }
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setGenre("");
                setYear("");
                setSortBy("popularity.desc");
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-100"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2A2A2A",
                color: "#6B7280",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
