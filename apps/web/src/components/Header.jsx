"use client";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bookmark,
  BarChart2,
  Film,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function Header({ activePage }) {
  const { data: user, loading: userLoading } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Discover", href: "/", icon: <Film size={14} /> },
    { label: "Search", href: "/search", icon: <Search size={14} /> },
    { label: "Watchlist", href: "/watchlist", icon: <Bookmark size={14} /> },
    { label: "Dashboard", href: "/dashboard", icon: <BarChart2 size={14} /> },
  ];

  const avatarLetter =
    user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-150"
      style={{
        backgroundColor: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid #1F1F1F" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5"
          style={{ textDecoration: "none" }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ backgroundColor: "#2563EB" }}
          >
            <Film size={16} color="white" />
          </div>
          <div>
            <span className="text-base font-semibold text-white tracking-tight">
              CineMatch
            </span>
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: "#2563EB" }}
            >
              {" "}
              AI
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-100"
              style={{
                textDecoration: "none",
                color: activePage === link.href ? "#F9FAFB" : "#6B7280",
                backgroundColor:
                  activePage === link.href ? "#1F1F1F" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (activePage !== link.href)
                  e.currentTarget.style.color = "#D1D5DB";
              }}
              onMouseLeave={(e) => {
                if (activePage !== link.href)
                  e.currentTarget.style.color = "#6B7280";
              }}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Auth area */}
          {!userLoading &&
            (user ? (
              /* Logged in: avatar dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors duration-100"
                  style={{
                    backgroundColor: profileOpen ? "#1F1F1F" : "transparent",
                    border: "1px solid",
                    borderColor: profileOpen ? "#2A2A2A" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1A1A1A";
                    e.currentTarget.style.borderColor = "#2A2A2A";
                  }}
                  onMouseLeave={(e) => {
                    if (!profileOpen) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    }}
                  >
                    {avatarLetter}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-300 max-w-24 truncate">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown
                    size={12}
                    color="#6B7280"
                    style={{
                      transform: profileOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 rounded-xl py-1.5 z-50"
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid #2A2A2A",
                      minWidth: 180,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div className="px-3 py-2 border-b border-[#2A2A2A] mb-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {user.name || "My Account"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <a
                      href="/watchlist"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 transition-colors duration-100"
                      style={{ textDecoration: "none" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#1A1A1A";
                        e.currentTarget.style.color = "#F9FAFB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#9CA3AF";
                      }}
                    >
                      <Bookmark size={14} /> My Library
                    </a>
                    <a
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 transition-colors duration-100"
                      style={{ textDecoration: "none" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#1A1A1A";
                        e.currentTarget.style.color = "#F9FAFB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#9CA3AF";
                      }}
                    >
                      <BarChart2 size={14} /> Analytics
                    </a>
                    <div className="border-t border-[#2A2A2A] mt-1 pt-1">
                      <a
                        href="/account/logout"
                        className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100"
                        style={{ textDecoration: "none", color: "#9CA3AF" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(220,38,38,0.06)";
                          e.currentTarget.style.color = "#F87171";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#9CA3AF";
                        }}
                      >
                        <LogOut size={14} /> Sign Out
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out: Sign in + Sign up buttons */
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/account/signin"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-100"
                  style={{ color: "#9CA3AF", textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#F9FAFB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#9CA3AF")
                  }
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors duration-100"
                  style={{ backgroundColor: "#2563EB", textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1D4ED8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2563EB")
                  }
                >
                  <User size={13} /> Sign Up
                </a>
              </div>
            ))}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{
              backgroundColor: "#141414",
              border: "1px solid #2A2A2A",
              color: "#9CA3AF",
            }}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 space-y-1"
          style={{
            backgroundColor: "rgba(10,10,10,0.98)",
            borderBottom: "1px solid #1F1F1F",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                textDecoration: "none",
                color: activePage === link.href ? "#F9FAFB" : "#6B7280",
                backgroundColor:
                  activePage === link.href ? "#1F1F1F" : "transparent",
              }}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
          {/* Mobile auth links */}
          <div className="border-t border-[#1F1F1F] pt-2 mt-2 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                    }}
                  >
                    {avatarLetter}
                  </div>
                  <span className="text-sm text-gray-400 truncate">
                    {user.email}
                  </span>
                </div>
                <a
                  href="/account/logout"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ textDecoration: "none", color: "#F87171" }}
                >
                  <LogOut size={14} /> Sign Out
                </a>
              </>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ textDecoration: "none", color: "#9CA3AF" }}
                >
                  <User size={14} /> Sign In
                </a>
                <a
                  href="/account/signup"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ textDecoration: "none", backgroundColor: "#2563EB" }}
                >
                  <User size={14} /> Sign Up Free
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
