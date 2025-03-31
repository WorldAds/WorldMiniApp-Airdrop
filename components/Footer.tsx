"use client";

import { usePathname } from "next/navigation";
import DataButton from "./buttons/DataButton";
import CryptoButton from "./buttons/CryptoButton";
import ProfileButton from "./buttons/ProfileButton";
import WatchButton from "./buttons/WatchButton";

export default function Footer() {
  const pathname = usePathname();
  const isDataCenter = pathname === "/data-center";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30">
      <div className="flex justify-around items-center w-full py-1 px-2
        bg-[#2A203B]/80 backdrop-blur-[2px] border-t border-white/10">
        {isDataCenter ? (
          <>
            <WatchButton />
            <CryptoButton />
          </>
        ) : (
          <>
            <DataButton />
            <CryptoButton />
          </>
        )}
      </div>
    </footer>
  );
}
