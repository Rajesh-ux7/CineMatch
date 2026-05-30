"use client";
import { useEffect } from "react";
import { Film, Loader2 } from "lucide-react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({ callbackUrl: "/", redirect: true });
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
          }}
        >
          <Film size={22} color="white" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Signing you out…
        </div>
      </div>
    </div>
  );
}
