import { useState, useEffect } from "react";
import useUser from "./useUser";

let _sessionId = null;

export function getSessionId() {
  if (typeof window === "undefined") return "server";
  if (_sessionId) return _sessionId;
  let id = localStorage.getItem("cinematch_session_id");
  if (!id) {
    id = "sess_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("cinematch_session_id", id);
  }
  _sessionId = id;
  return id;
}

/**
 * Returns 'user_<id>' when logged in, or anonymous session ID otherwise.
 * This ties logged-in users' watchlists/favorites to their account across devices.
 */
export function useEffectiveSessionId() {
  const { data: user, loading } = useUser();
  const [anonId, setAnonId] = useState("");

  useEffect(() => {
    setAnonId(getSessionId());
  }, []);

  if (loading) return "";
  if (user?.id) return `user_${user.id}`;
  return anonId;
}
