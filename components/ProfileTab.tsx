"use client";

import { User } from "@/contexts/AuthContext";

interface ProfileTabProps {
  user: User | null;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  if (!user) {
    return (
      <div className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                      rounded-lg p-6 backdrop-blur-sm border border-white/10">
        <div className="space-y-4 text-center">
          <p className="text-lg text-gray-400">
            Please connect your wallet to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                    rounded-lg p-6 backdrop-blur-sm border border-white/10">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">World ID</label>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            {user.worldId}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Name</label>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            {user.nickname || "Not set"}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-400">Wallet Address</label>
          <p className="text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}
