"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import UserAvatar from "./UserAvatar";
import WorldIDComponent from "./WorldIDComponent";
import DataTab from "./DataTab";
import BalanceTab from "./BalanceTab";
import ProfileTab from "./ProfileTab";
import Footer from "./Footer";
import { MiniKit } from "@worldcoin/minikit-js";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "next-auth/react";

export default function DataCenterScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "data";
  const [activeTab, setActiveTab] = useState(initialTab.toLowerCase());
  const [walletAddress, setWalletAddress] = useState("");
  const { user, isAuthenticated, login } = useAuth();
  const { data: session } = useSession();

  useEffect(() => {
    // If MiniKit is installed, retrieve the wallet address
    if (MiniKit.isInstalled()) {
      const address = MiniKit.walletAddress; // This is set after a successful walletAuth
      if (address) {
        setWalletAddress(address);
      }
    }
  }, []);

  // Try to login if we have session and wallet address but no user
  useEffect(() => {
    const attemptLogin = async () => {
      if (!isAuthenticated && session?.user?.id && walletAddress) {
        try {
          await login(session.user.id, walletAddress);
        } catch (error) {
          console.error("Auto-login error:", error);
        }
      }
    };

    attemptLogin();
  }, [isAuthenticated, session, walletAddress, login]);

  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white pb-12">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button
          onClick={() => router.replace('/ads')}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-lg font-medium">Data Center</h2>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-4 pt-8">
        <UserAvatar />
        <WorldIDComponent />

        {/* Tabs */}
        <div className="flex gap-4 mt-8 mb-4 relative">
          {["Data", "Balance", "Profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab.toLowerCase());
                router.push(`?tab=${tab.toLowerCase()}`);
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all
                ${
                  activeTab === tab.toLowerCase()
                    ? "bg-gradient-to-r from-[#AC54F1] to-[#EB489A] text-white"
                    : "text-gray-400 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === "data" && <DataTab />}
          {activeTab === "balance" && <BalanceTab />}
          {activeTab === "profile" && <ProfileTab user={user} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
