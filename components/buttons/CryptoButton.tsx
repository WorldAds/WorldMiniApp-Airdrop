"use client";

import Image from "next/image";
import cryptoIcon from "../../public/icons/crypto.png";
import { useRouter } from "next/navigation";

export default function CryptoButton() {
  const router = useRouter();
  return (
    <div
      className="flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
      onClick={() => router.push("/data-center")}
      role="button"
      aria-label="Crypto"
    >
      <Image 
        src={cryptoIcon} 
        alt="Crypto" 
        width={32} 
        height={32}
        className="mb-0.5" 
      />
      <h1 className="text-[12px] font-medium bg-gradient-to-b from-[#9818FD] to-[#FD1288] bg-clip-text text-transparent">
        Crypto
      </h1>
    </div>
  );
}
