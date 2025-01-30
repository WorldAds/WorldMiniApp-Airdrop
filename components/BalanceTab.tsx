"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface TokenPrice {
  symbol: string;
  price: number;
  balance: number;
  icon: string;
}

export default function BalanceTab() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Simulated API call - replace with actual CoinGecko/CMC API
        const mockData: TokenPrice[] = [
          {
            symbol: "WLD",
            price: 2.45,
            balance: 100,
            icon: "https://assets.coingecko.com/coins/images/31069/small/worldcoin.jpeg",
          },
          {
            symbol: "ETH",
            price: 3450.78,
            balance: 0.5,
            icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
          },
        ];

        setTokens(mockData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prices:", error);
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-[#AC54F1]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tokens.map((token) => (
        <div
          key={token.symbol}
          className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                     rounded-lg p-4 backdrop-blur-sm border border-white/10"
        >
          <div className="flex items-center gap-4">
            <img
              src={token.icon}
              alt={token.symbol}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{token.symbol}</h3>
              <div className="flex justify-between mt-2">
                <span className="text-gray-300">
                  Price: ${token.price.toFixed(2)}
                </span>
                <span className="text-gray-300">
                  Balance: {token.balance} {token.symbol}
                </span>
              </div>
              <div className="mt-2 text-right text-lg font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
                ${(token.balance * token.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
