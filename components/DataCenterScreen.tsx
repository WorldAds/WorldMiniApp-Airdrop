"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import UserAvatar from "./UserAvatar";
import WorldIDComponent from "./WorldIDComponent";
import DataTab from "./DataTab";
import BalanceTab from "./BalanceTab";
import ProfileTab from "./ProfileTab";
import Footer from "./Footer";
import { MiniKit } from "@worldcoin/minikit-js";

export default function DataCenterScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("data");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    // 3) If MiniKit is installed, retrieve the wallet address
    if (MiniKit.isInstalled()) {
      const address = MiniKit.walletAddress; // This is set after a successful walletAuth
      if (address) {
        setWalletAddress(address);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1B2E] text-white pb-32">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center text-lg font-medium">Data Center</h2>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-4 pt-6">
        <UserAvatar />
        <WorldIDComponent />

        {/* Tabs */}
        <div className="flex gap-4 mt-6 mb-12 relative">
          {["Data", "Balance", "Profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
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

          <div className="absolute top-[50px] -translate-x-1/2 left-1/2">
            Wallet Address:{" "}
            <span className="font-semibold truncate h-[100px]">{walletAddress}</span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex w-full justify-center items-center">
          {activeTab === "data" && <DataTab />}
          {activeTab === "balance" && <BalanceTab />}
          {activeTab === "profile" && <ProfileTab />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
