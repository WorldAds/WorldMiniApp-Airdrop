"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signIn } from "next-auth/react";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    const result = await signIn("worldcoin", {
      redirect: true,
      callbackUrl: "/wallet-auth",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
      <div className="relative w-[79px] h-[79px] mb-6">
        <div className="absolute w-full h-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] rounded-lg">
          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-[40px] font-inter">
            W
          </span>
        </div>
      </div>

      <h1 className="text-[36px] font-semibold font-inter leading-[44px] tracking-[0.03em] text-center mb-8 bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
        Welcome to WorldAds
      </h1>

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#AC54F1] to-[#EB489A] rounded-full text-white font-semibold transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
      >
        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <span className="text-[#AC54F1] font-semibold">W</span>
        </span>
        {isLoading ? "Logging in..." : "Log in with WorldAds"}
      </button>
    </div>
  );
}
