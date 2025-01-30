"use client"; // Required for Next.js

import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_APP_ID;
  useEffect(() => {
    if (MiniKit.install(appId || "")) {
      console.log("MiniKit is installed inside the World App.");
    } else {
      console.log(
        "MiniKit is not installed. You may be outside the World App."
      );
    }
  }, []);

  return <>{children}</>;
}
