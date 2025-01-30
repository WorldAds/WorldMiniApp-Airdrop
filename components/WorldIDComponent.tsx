"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function WorldIDComponent() {
  const { data: session } = useSession();
  const [worldID, setWorldID] = useState("");

  useEffect(() => {
    if (session?.user?.id) {
      setWorldID(session.user.id); // Fetching World ID from NextAuth session
    }
  }, [session]);

  return (
    <div className="mt-4 text-center">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
        World ID: {worldID ? worldID : "Not Authenticated"}
      </h3>
    </div>
  );
}
