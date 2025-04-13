"use client";

import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function UserAvatar() {
  const { user } = useAuth();
  
  // If user has an avatar URL, display it
  if (user?.avatarUrl) {
    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] p-1">
        <div className="w-full h-full rounded-full overflow-hidden">
          <Image 
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.avatarUrl}`} 
            alt="User Avatar" 
            width={96} 
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }
  
  // Default avatar with first letter of nickname or "W"
  const displayLetter = user?.nickname ? user.nickname.charAt(0).toUpperCase() : "W";
  
  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] p-1">
      <div className="w-full h-full rounded-full bg-[#1E1B2E] flex items-center justify-center">
        <span className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#AC54F1] to-[#EB489A]">
          {displayLetter}
        </span>
      </div>
    </div>
  );
}
