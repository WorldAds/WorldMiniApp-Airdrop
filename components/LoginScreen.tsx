"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signIn("worldcoin", {
        redirect: true,
        callbackUrl: "/wallet-auth",
      });
    } catch (error) {
      console.error("Login failed", error);
    }
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
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#AC54F1] to-[#EB489A] rounded-full text-white font-semibold transition-transform hover:scale-105"
      >
        <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <span className="text-[#AC54F1] font-semibold">W</span>
        </span>
        Log in with WorldAds
      </button>
    </div>
  );
}
