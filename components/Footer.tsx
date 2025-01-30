"use client";

import { usePathname } from "next/navigation";
import DataButton from "./buttons/DataButton";
import CryptoButton from "./buttons/CryptoButton";
import ProfileButton from "./buttons/ProfileButton";
import WatchButton from "./buttons/WatchButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isDataCenter = pathname === "/data-center";
  const router = useRouter();

  const handleClick = () => {
    router.push("/data-center");
  };
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#2A203B] p-6 z-50">
      <div
        className="flex justify-around items-center w-[90%] backdrop-blur-[4px] rounded-[100px] z-10 bg-black p-2 fixed bottom-2 left-1/2 transform -translate-x-1/2"
        style={{
          background:
            "linear-gradient(165.97deg, rgba(255, 255, 255, 0.05) 10.46%, rgba(255, 203, 62, 0.05) 90.67%)",
          marginBottom: "8%",
        }}
      >
        {isDataCenter ? (
          <>
            <WatchButton />
            <CryptoButton />
          </>
        ) : (
          <>
            <DataButton />
            <CryptoButton />
            <button onClick={handleClick}>
              <ProfileButton />
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
